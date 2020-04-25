using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PuppeteerSharp;
using VetGuardian.Core.Enumeration;
using VetGuardian.Core.Models;
using VetGuardian.Core.Query;
using VetGuardian.Managers;
using VetGuardian.Extensions;
using VetGuardian.Web.Models;

namespace VetGuardian.Web.Controllers
{
    [Route("api/[controller]")]
    public class RunsController : Controller
    {
        private readonly RunManager _runManager;
        private readonly RunDataManager _runDataManager;
        private readonly RunLogManager _runLogManager;
        private readonly StaffManager _staffManager;
        private readonly PatientManager _patientManager;
        private readonly SettingsManager _settingsManager;
        private readonly VersionManager _versionManager;

        public RunsController(RunManager runManager, RunDataManager runDataManager, RunLogManager runLogManager, StaffManager staffManager, PatientManager patientManager, SettingsManager SettingsManager, VersionManager VersionManager)
        {
            _runManager = runManager;
            _runDataManager = runDataManager;
            _runLogManager = runLogManager;
            _staffManager = staffManager;
            _patientManager = patientManager;
            _settingsManager = SettingsManager;
            _versionManager = VersionManager;
        }

        [HttpGet]
        public async Task<IEnumerable<RunViewModel>> GetAllRuns()
        {
            return await Task.WhenAll((await _runManager.QueryAsync()).Select(async t => new RunViewModel 
            {
                Run = t,
                Patient = await _patientManager.ReadAsync(t.PatientId)
            }));
        }

        [HttpGet("search/{name}")]
        public async Task<IEnumerable<RunViewModel>> GetFilteredRuns(string name)
        {
            return await Task.WhenAll((await _runManager.QueryAsync(new RunQuery { Name = name })).Select(async t => new RunViewModel
            {
                Run = t,
                AttendingDoctor = await _staffManager.ReadAsync(t.AttendingDoctorId),
                VetTech = await _staffManager.ReadAsync(t.VetTechId),
                Patient = await _patientManager.ReadAsync(t.PatientId)
            }));
        }

        [HttpGet("{runId}")]
        public async Task<ActionResult<RunViewModel>> GetRunById(string runId)
        {
            var getRun = await GetRunStaffPatient(runId);
            if(!IsRunValid(getRun.Run, getRun.Patient))
            {
                return NotFound();
            }

            return new RunViewModel 
            {
                Run = getRun.Run,
                AttendingDoctor = getRun.Doctor,
                VetTech = getRun.VetTech,
                Patient = getRun.Patient
            };
        }

        [HttpGet("{runId}/logs")]
        public async Task<ActionResult<PagedResult<RunLog>>> GetLogsByRunById(string runId)
        {
            var query = new RunLogQuery() {
                RunId = runId
            };

            query.OrderByDescending(RunLogQuery.SortColumns.Timestamp);

            return await _runLogManager.QueryAsync(query);
        }

        [HttpPost("{runId}/logs")]
        public async Task<IActionResult> CreateLogForRunId(string runId, string message, LogType logType = LogType.User)
        {
            await _runLogManager.CreateAsync(new RunLog(runId, message, logType));
            return Ok();
        }

        [HttpGet("{runId}/data")]
        public async Task<ActionResult<PagedResult<RunData>>> GetDataByRunById(string runId)
        {
            var query = new RunDataQuery() {
                RunId = runId
            };

            query.OrderByDescending(RunDataQuery.SortColumns.Timestamp);

            return await _runDataManager.QueryAsync(query);
        }

        [HttpGet("{runId}/export/vet/summary")]
        public async Task<ActionResult> ExportVetSummary(string runId)
        {
            var getRun = await GetRunStaffPatient(runId);
            if(!IsRunValid(getRun.Run, getRun.Patient))
            {
                return NotFound();
            }

            Stream stream = await _runManager.ExportVetSummary(runId);
            if(stream == null)
            {
                return NotFound();
            }

            string fileName = string.Format("{0}_{1}_{2}_vet.txt", getRun.Run.Timestamp.ToLocalTimeExt().ToString("yyyyMMddHHmmss"), getRun.Patient.OwnerName, getRun.Patient.Name);
            return File(stream, "text/plain", fileName);
        }

        [HttpGet("{runId}/export/vet/summary-pdf-template")]
        public async Task<ActionResult> VetSummaryPDFTemplate(string runId)
        {
            var getRun = await GetRunStaffPatient(runId);
            if(!IsRunValid(getRun.Run, getRun.Patient))
            {
                return NotFound();
            }

            VetSettings vetSettings = await _settingsManager.GetVetSettings();

            RunDataQuery runDataQuery = new RunDataQuery { RunId = runId };
            runDataQuery.OrderBy(RunDataQuery.SortColumns.Timestamp);

            RunDataQuery runImageQuery = new RunDataQuery { RunId = runId, HasImage = true, Skip = 0, Take = 1 };
            runImageQuery.OrderBy(RunDataQuery.SortColumns.Timestamp);

            RunLogQuery runLogQuery = new RunLogQuery { RunId = runId };
            runLogQuery.OrderBy(RunLogQuery.SortColumns.Timestamp);

            Task<PagedResult<RunData>> dataTask = _runDataManager.QueryAsync(runDataQuery);
            Task<PagedResult<RunData>> imageTask = _runDataManager.QueryAsync(runImageQuery);
            Task<PagedResult<RunLog>> logTask = _runLogManager.QueryAsync(runLogQuery);

            PagedResult<RunData> data = await dataTask;
            PagedResult<RunData> image = await imageTask;
            PagedResult<RunLog> log = await logTask;

            List<RunData> runData = data.Where(t => t.Status.HasFlag(UnitStatus.BodyDetected)).ToList();
            List<RunLog> runLog = log.Where(t => t.LogType == LogType.User).ToList();
            List<RunData> images = image.ToList();
            
            PDFTemplateViewModel model = new PDFTemplateViewModel
            {
                Run = getRun.Run,
                AttendingDoctor = getRun.Doctor,
                VetTech = getRun.VetTech,
                Patient = getRun.Patient,
                VetSettings = vetSettings,
                Data = runData,
                Log = runLog,
                Version = _versionManager.GetVersion(),
                Images = images
            };

            return View(model);
        }

        [HttpGet("{runId}/export/vet/summary-pdf")]
        public async Task<ActionResult> VetSummaryPDF(string runId, bool save = true)
        {
            var getRun = await GetRunStaffPatient(runId);
            if(!IsRunValid(getRun.Run, getRun.Patient))
            {
                return NotFound();
            }

            string fileName = string.Format("{0}_{1}_vet.pdf", getRun.Patient.Name, getRun.Run.Timestamp.ToLocalTimeExt().ToString("yyyyMMddHHmmss"));

            if(!string.IsNullOrWhiteSpace(getRun.Patient.PatientId))
            {
                fileName = string.Format("{0}_{1}", getRun.Patient.PatientId, fileName);
            }

            var fetch = await new BrowserFetcher().DownloadAsync(BrowserFetcher.DefaultRevision);
            var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true,
                IgnoreHTTPSErrors = true,
                ExecutablePath = fetch.ExecutablePath
            });

            var page = await browser.NewPageAsync();
            await page.GoToAsync(Url.Action(nameof(VetSummaryPDFTemplate), null, new { runId }, Request.Scheme));

            PdfOptions pdfOptions = new PdfOptions
            {
                PrintBackground = true,
                MarginOptions = new PuppeteerSharp.Media.MarginOptions()
                {
                    Top = "0.25in",
					Bottom = "0.5in"
                },
				DisplayHeaderFooter = true,
				HeaderTemplate = "<div></div>",
				FooterTemplate = $"<style>.wrapper {{ width: 6.7in; font-size: 8px; margin-left: 0.3in; margin-right: 0.3in;  }}</style><div class=\"wrapper\"><div style=\"float: right;\"><span class=\"pageNumber\"></span>/<span class=\"totalPages\"></span></div>VetGuardian {_versionManager.GetVersion()}</div>"
            };

            Stream result = await page.PdfStreamAsync(pdfOptions);

            browser.Dispose();

            if(!save)
            {
                fileName = null;
            }

            return File(result, "application/pdf", fileName);
        }

        [HttpGet("{runId}/export/smp/summary")]
        public async Task<ActionResult> ExportSmpSummary(string runId)
        {
            var getRun = await GetRunStaffPatient(runId);
            if(!IsRunValid(getRun.Run, getRun.Patient))
            {
                return NotFound();
            }

            Stream stream = await _runManager.ExportSmpLog(runId);
            if(stream == null)
            {
                return NotFound();
            }

            string fileName = string.Format("{0}_{1}_{2}_smp.txt", getRun.Run.Timestamp.ToLocalTimeExt().ToString("yyyyMMddHHmmss"), getRun.Patient.OwnerName, getRun.Patient.Name);

            return File(stream, "text/plain", fileName);
        }

        [HttpGet("{runId}/export/smp/csv")]
        public async Task<ActionResult> ExportSmpCsv(string runId)
        {
            var getRun = await GetRunStaffPatient(runId);
            if(!IsRunValid(getRun.Run, getRun.Patient))
            {
                return NotFound();
            }

            Stream stream = await _runManager.ExportSmpCsv(runId);
            if(stream == null)
            {
                return NotFound();
            }

            string fileName = string.Format("{0}_{1}_{2}_smp.csv", getRun.Run.Timestamp.ToLocalTimeExt().ToString("yyyyMMddHHmmss"), getRun.Patient.OwnerName, getRun.Patient.Name);

            return File(stream, "text/csv", fileName);
        }

        private bool IsRunValid(Run run, Patient patient)
        {
            if(run != null && patient != null){
                return true;
            }
            return false;
        }

        private async Task<(Run Run, Staff Doctor, Staff VetTech, Patient Patient)> GetRunStaffPatient(string runId)
        {
            Run run = await _runManager.ReadAsync(runId);
            if (run == null)
            {
                return (null, null, null, null);
            }

            Staff doctor = await _staffManager.ReadAsync(run.AttendingDoctorId);
            Staff vetTech = await _staffManager.ReadAsync(run.VetTechId);

            Patient patient = await _patientManager.ReadAsync(run.PatientId);
            if(patient == null)
            {
                return (run, doctor, vetTech, null);
            }

            return (run, doctor, vetTech, patient);
        }
    }
}