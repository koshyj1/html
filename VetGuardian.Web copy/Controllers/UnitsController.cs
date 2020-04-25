using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using VetGuardian.Core.Api;
using VetGuardian.Core.Models;
using VetGuardian.Core.Enumeration;
using VetGuardian.Core.ViewModels;
using VetGuardian.Core.Query;
using VetGuardian.Hubs;
using VetGuardian.Managers;
using VetGuardian.Services;

namespace VetGuardian.Web.Controllers
{
    [Route("api/[controller]")]
    public class UnitsController : Controller
    {
        private readonly UnitManager _unitManager;
        private readonly PatientManager _patientManager;
        private readonly RunManager _runManager;
        private readonly DataAcquisitionService _dataAcquisitionService;

        public UnitsController(UnitManager unitManager, PatientManager patientManager, RunManager runManager, DataAcquisitionService dataAcquisitionService)
        {
            _unitManager = unitManager;
            _patientManager = patientManager;
            _runManager = runManager;
            _dataAcquisitionService = dataAcquisitionService;
        }

        /// <summary>
        /// Creates a unit.
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(typeof(ApiError), 400)]
        public async Task<IActionResult> Create([FromBody]CreateUnitViewModel model)
        {
            if (ModelState.IsValid)
            {
                Unit unit = new Unit(model);
                await _unitManager.CreateAsync(unit);
                _dataAcquisitionService.AddUnit(unit.Id);
                return Ok(unit.Id);
            }
            return BadRequest(new ApiError(ModelState));
        }

        /// <summary>
        /// Get all units.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<PagedResult<Unit>> GetAll()
        {
            return await _unitManager.QueryAsync();
        }

        /// <summary>
        /// Gets a specific unit.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Unit>> Read(string id)
        {
            Unit unit = await _unitManager.ReadAsync(id);
            if(unit == null)
            {
                return NotFound();
            }

            return unit;
        }

        /// <summary>
        /// Get a summary of the current status of all of the units.
        /// </summary>
        /// <returns></returns>
        [HttpGet("summary")]
        public ActionResult<List<UnitSummary>> GetUnitSummary()
        {
            return _dataAcquisitionService.GetUnitSummary();
        }

        /// <summary>
        /// Updates a unit.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(void), 200)]
        [ProducesResponseType(typeof(ApiError), 400)]
        [ProducesResponseType(typeof(void), 404)]
        public async Task<IActionResult> Update(string id, [FromBody]UnitViewModel model)
        {
            if (ModelState.IsValid)
            {
                Unit unit = await _unitManager.ReadAsync(id);
                if (unit == null || unit.Id != model.Id)
                {
                    return NotFound();
                }
                if (_dataAcquisitionService.IsInUse(id))
                {
                    return BadRequest(new ApiError("Unable to update unit while it is in use."));
                }

                unit.Modified = DateTime.UtcNow;
                unit.Name = model.Name;
                unit.CameraHostname = model.CameraHostname;
                unit.CameraUsername = model.CameraUsername;
                unit.CameraPassword = model.CameraPassword;
                unit.SerialNumber = model.SerialNumber;
                unit.SensorIpAddress = model.SensorIpAddress;
                unit.Simulate = model.Simulate;

                await _unitManager.UpdateAsync(unit);
                _dataAcquisitionService.UpdateUnit(id);
                return Ok();
            }
            return BadRequest(new ApiError(ModelState));
        }

        /// <summary>
        /// Delets a unit.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if(_dataAcquisitionService.IsInUse(id))
            {
                return BadRequest(new ApiError("Unable to delete unit while it is in use."));
            }

            await _unitManager.DeleteAsync(id);
            _dataAcquisitionService.RemoveUnit(id);

            return Ok();
        }

        /// <summary>
        /// Starts data acquisition process which starts reading from the sensor and recording to the database.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="patientId"></param>
        /// <param name="temperature"></param>
        /// <param name="heartRate"></param>
        /// <param name="respirationRate"></param>
        /// <param name="weight"></param>
        /// <param name="weightUnit"></param>
        /// <param name="temperatureUnit"></param>
        /// <param name="attendingDoctorId"></param>
        /// <param name="vetTechId"></param>
        /// <returns></returns>
        [HttpPut("{id}/dataacquisition/start")]
        public async Task<IActionResult> StartUnitDataAcquisition(string id, [Required]string patientId, decimal? temperature = null, int? heartRate = null, int? respirationRate = null, decimal? weight = null, WeightUnit? weightUnit = null, TemperatureUnit? temperatureUnit = null, string attendingDoctorId = "", string vetTechId = "")
        {
            Unit unit = await _unitManager.ReadAsync(id);
            if(unit == null)
            {
                return NotFound();
            }

            Patient patient = await _patientManager.ReadAsync(patientId);
            if(patient == null)
            {
                return BadRequest();
            }

            RunQuery runQuery = new RunQuery
            {
                Take = 1,
                UnitId = unit.Id,
                PatientId = patient.Id
            };
            runQuery.Sort[0] = (RunQuery.SortColumns.Modified, SortDirection.Descending);

            Run lastRun = (await _runManager.QueryAsync(runQuery)).SingleOrDefault();
            if(lastRun != null && lastRun.UploadStatus == UploadStatus.RunPaused)
            {
                _dataAcquisitionService.RestartUnitDataAcquisition(unit, patient, lastRun, temperature, heartRate, respirationRate, weight, weightUnit, temperatureUnit, attendingDoctorId, vetTechId);
            }
            else 
            {
                _dataAcquisitionService.StartUnitDataAcquisition(unit, patient, temperature, heartRate, respirationRate, weight, weightUnit, temperatureUnit, attendingDoctorId, vetTechId);
            }

            return Ok();
        }

        /// <summary>
        /// Pause current unit data acquisition.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("{id}/dataacquisition/pause")]
        public async Task<IActionResult> PauseUnitDataAcquisition(string id)
        {
            Unit unit = await _unitManager.ReadAsync(id);
            if(unit == null)
            {
                return NotFound();
            }

            if(_dataAcquisitionService.IsInUse(unit.Id))
            {
                _dataAcquisitionService.PauseUnitDataAcquisition(id);
            }

            return Ok();
        }

        /// <summary>
        /// Stops data acquisition.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("{id}/dataacquisition/stop")]
        public async Task<IActionResult> StopUnitDataAcquisition(string id)
        {
            Unit unit = await _unitManager.ReadAsync(id);
            if(unit == null)
            {
                return NotFound();
            }

            _dataAcquisitionService.StopUnitDataAcquisition(id);

            return Ok();
        }

        /// <summary>
        /// Starts capturing video.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("{id}/video/start")]
        public async Task<IActionResult> StartUnitVideo(string id)
        {
            Unit unit = await _unitManager.ReadAsync(id);
            if(unit == null)
            {
                return NotFound();
            }

            _dataAcquisitionService.StartUnitVideo(id);

            return Ok();
        }

        /// <summary>
        /// Stops capturing video.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("{id}/video/stop")]
        public async Task<IActionResult> StopUnitVideo(string id)
        {
            Unit unit = await _unitManager.ReadAsync(id);
            if(unit == null)
            {
                return NotFound();
            }

            _dataAcquisitionService.StopUnitVideo(id);

            return Ok();
        }

        /// <summary>
        /// Gets the latest frame of video from the unit.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}/video/latest")]
        public async Task<IActionResult> ReadLatestFrame(string id)
        {
            Unit unit = await _unitManager.ReadAsync(id);
            if(unit == null)
            {
                return NotFound();
            }

            byte[] frame = _dataAcquisitionService.GetLatestFrame(id);
            if(frame == null)
            {
                return NotFound();
            }

            return File(frame, "image/jpg");
        }

        /// <summary>
        /// Clears the patient and run from the unit, marking the unit as unoccupied.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("{id}/clear")]
        public async Task<IActionResult> ClearUnit(string id)
        {
            Unit unit = await _unitManager.ReadAsync(id);
            if(unit == null)
            {
                return NotFound();
            }

            _dataAcquisitionService.ClearUnit(id);

            return Ok();
        }

        /// <summary>
        /// Acknowledges an alarm.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut("{id}/acknowledgealarm")]
        public ActionResult AcknowledgeAlarm(string id)
        {
            _dataAcquisitionService.AlarmAcknowledged(id);
            return Ok();
        }
        
        /// <summary>
        /// Sets the temperature associated with the unit
        /// </summary>
        /// <param name="id"></param>
        /// <param name="temperature"></param>
        /// <returns></returns>
        [HttpPut("{id}/temperature")]
        public ActionResult SetTemperature(string id, [Required]decimal? temperature)
        {
            _dataAcquisitionService.SetTemperature(id, temperature);
            return Ok();
        }

        /// <summary>
        /// Sets the manual heartrate.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="heartRate"></param>
        /// <returns></returns>
        [HttpPut("{id}/heartrate")]
        public ActionResult SetHeartRate(string id, [Required]int? heartRate)
        {
            _dataAcquisitionService.SetManualHeartRate(id, heartRate);
            return Ok();
        }

        /// <summary>
        /// Sets the manual respiration rate.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="respirationRate"></param>
        /// <returns></returns>
        [HttpPut("{id}/respirationrate")]
        public ActionResult SetRespirationRate(string id, [Required]int? respirationRate)
        {
            _dataAcquisitionService.SetManualRespirationRate(id, respirationRate);
            return Ok();
        }
    }
}