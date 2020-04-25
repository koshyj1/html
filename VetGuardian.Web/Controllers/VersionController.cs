using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using VetGuardian.Core.Models;
using VetGuardian.Core.ViewModels;
using VetGuardian.Core.Query;
using VetGuardian.Core.Api;
using VetGuardian.Hubs;
using VetGuardian.Managers;
using VetGuardian.Services;

namespace VetGuardian.Web.Controllers
{
    [Route("api/[controller]")]
    public class VersionController : Controller
    {
        private readonly VersionManager _versionManager;

        public VersionController(VersionManager versionManager)
        {
            _versionManager = versionManager;
        }

        [HttpGet]
        public System.Version GetVersion()
        {
            return _versionManager.GetVersion();
        }
    }
}