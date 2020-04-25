using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

using VetGuardian.Core.ViewModels;
using VetGuardian.Core.Enumeration;
using VetGuardian.Core.Models;
using VetGuardian.Core.Query;
using VetGuardian.Managers;

namespace VetGuardian.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : Controller
    {
        private readonly StaffManager _staffManager;
        private readonly SettingsManager _settingsManager;

        public StaffController(StaffManager staffManager, SettingsManager settingsManager)
        {
            _staffManager = staffManager;
            _settingsManager = settingsManager;
        }

        [HttpGet("types")]
        public IEnumerable<Enumeration> GetStaffTypes()
        {
            return EnumExtensions.GetValues<StaffType>().Select(t => new Enumeration
            { 
                Id = (int)t, 
                Name = t.GetDisplayName(),
                Initials = t.GetDisplayDescription()
            }).ToList();
        }

        /// <summary>
        /// Get all staffs.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IEnumerable<Staff>> GetAll()
        {
            return await _staffManager.QueryAsync();
        }

        /// <summary>
        /// Get a staff.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Staff), 200)]
        public async Task<Staff> GetById(string id)
        {
            return await _staffManager.ReadAsync(id);
        }

        /// <summary>
        /// Create a new staff.
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        public async Task<ActionResult> Create([FromBody] StaffViewModel model)
        {
            if (ModelState.IsValid)
            {
                Staff staff = new Staff();
                staff.StaffType = model.StaffType;
                staff.FirstName = model.FirstName;
                staff.LastName = model.LastName;

                await _staffManager.CreateAsync(staff);

                return Ok();
            }

            return BadRequest();
        }

        /// <summary>
        /// Updates an existing staff.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> Update(string id, [FromBody] StaffViewModel model)
        {
            if (ModelState.IsValid)
            {
                Staff staff = await _staffManager.ReadAsync(id);
                if (staff == null)
                {
                    return NotFound();
                }

                staff.Modified = DateTime.UtcNow;
                staff.StaffType = model.StaffType;
                staff.FirstName = model.FirstName;
                staff.LastName = model.LastName;

                await _staffManager.UpdateAsync(staff);

                return Ok();
            }

            return BadRequest();
        }

        /// <summary>
        /// Delete an existing staff.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> Delete(string id)
        {
            Staff staff = await _staffManager.ReadAsync(id);
            if (staff == null)
            {
                return NotFound();
            }

            var settings = await _settingsManager.GetVetSettings();
            if (!String.IsNullOrWhiteSpace(settings.DefaultAttendingDoctorId) && staff.Id.Equals(settings.DefaultAttendingDoctorId))
            {
                settings.DefaultAttendingDoctorId = null;
                await _settingsManager.SetVetSettings(settings);
            }
            else if (!String.IsNullOrWhiteSpace(settings.DefaultVetTechId) && staff.Id.Equals(settings.DefaultVetTechId))
            {
                settings.DefaultVetTechId = null;
                await _settingsManager.SetVetSettings(settings);
            }

            await _staffManager.DeleteAsync(staff.Id);

            return Ok();
        }
    }
}