using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using VetGuardian.Core.Models;
using VetGuardian.Services;

namespace VetGuardian.Web.Controllers
{
    [Route("api/[controller]")]
    public class DevicesController : Controller
    {
        private readonly DataAcquisitionService _dataAcquisitionService;

        public DevicesController(DataAcquisitionService dataAcquisitionService)
        {
            _dataAcquisitionService = dataAcquisitionService;
        }

        [HttpGet]
        public Task<List<Device>> GetAll()
        {
            return _dataAcquisitionService.GetDevices();
        }
    }
}