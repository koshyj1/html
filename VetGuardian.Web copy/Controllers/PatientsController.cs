using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

using VetGuardian.Core.Enumeration;
using VetGuardian.Core.Models;
using VetGuardian.Core.ViewModels;
using VetGuardian.Core.Query;
using VetGuardian.Core.Api;
using VetGuardian.Managers;
using VetGuardian.Services;
using VetGuardian.Web.Models;
using System;

namespace VetGuardian.Web.Controllers
{
    [Route("api/[controller]")]
    public class PatientsController : Controller
    {
        private readonly PatientManager _patientManager;

        public PatientsController(PatientManager patientManager)
        {
            _patientManager = patientManager;
        }

        [HttpPost]
        [ProducesResponseType(typeof(Patient), 200)]
        [ProducesResponseType(typeof(ApiError), 400)]
        public async Task<ActionResult<Patient>> Create([FromBody]PatientViewModel model)
        {
            if (ModelState.IsValid)
            {
                PagedResult<Patient> patients = await _patientManager.QueryAsync(new PatientQuery
                {
                    PatientId = model.PatientId
                });
                if (!patients.Any())
                {
                    Patient patient = new Patient(model);
                    await _patientManager.CreateAsync(patient);
                    return patient;
                }
                ModelState.AddModelError("PatientId", "The Patient ID is already used.");
            }
            return BadRequest(new ApiError(ModelState));
        }

        [HttpGet]
        public async Task<PagedResult<Patient>> GetAll()
        {
            return await _patientManager.QueryAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Patient>> Read(string id)
        {
            Patient patient = await _patientManager.ReadAsync(id);
            if (patient == null)
            {
                return NotFound();
            }

            return patient;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Patient>> Update(string id, [FromBody]PatientViewModel model)
        {
            if (ModelState.IsValid)
            {
                Patient patient = await _patientManager.ReadAsync(id);
                if (patient == null)
                {
                    return NotFound();
                }

                patient.Modified = DateTime.UtcNow;
                patient.Name = model.Name;
                patient.OwnerName = model.OwnerName;
                patient.Species = model.Species.Value;
                patient.Breed = model.Breed;
                patient.Age = model.Age.HasValue ? model.Age.Value : 0;
                patient.BirthDate = model.BirthDate.Value;
                patient.Weight = model.Weight.Value;
                patient.HeartRateLowAlarm = model.HeartRateLowAlarm.Value;
                patient.HeartRateLowWarning = model.HeartRateLowWarning.Value;
                patient.HeartRateHighAlarm = model.HeartRateHighAlarm.Value;
                patient.HeartRateHighWarning = model.HeartRateHighWarning.Value;
                patient.RespirationRateLowAlarm = model.RespirationRateLowAlarm.Value;
                patient.RespirationRateLowWarning = model.RespirationRateLowWarning.Value; ;
                patient.RespirationRateHighAlarm = model.RespirationRateHighAlarm.Value;
                patient.RespirationRateHighWarning = model.RespirationRateHighWarning.Value;
                patient.WarningTimer = model.WarningTimer.HasValue ? model.WarningTimer.Value : 0;
                patient.Sex = model.Sex.Value;
                patient.PatientId = model.PatientId;
                patient.TemperatureUnit = model.TemperatureUnit;
                patient.WeightUnit = model.WeightUnit;

                await _patientManager.UpdateAsync(patient);
                return patient;
            }
            return BadRequest(new ApiError(ModelState));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _patientManager.DeleteAsync(id);
            return Ok();
        }
    }
}