using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VetGuardian.Core.Models;
using VetGuardian.Managers;
using VetGuardian.Web.Models;

namespace VetGuardian.Web.Controllers
{
    [Route("api/[controller]")]
    public class SettingsController : Controller
    {
        private readonly SettingsManager _settingsManager;

        public SettingsController(SettingsManager settingsManager)
        {
            _settingsManager = settingsManager;

        }
        
        [HttpGet("admin-settings")]
        public async Task<AdminSettings> GetAdminSettings()
        {
            return await _settingsManager.GetAdminSettings();
        }

        [HttpPut("admin-settings")]
        public async Task<ActionResult> SetAdminSettings([FromBody]UpdateAdminSettingsViewModel model)
        {
            AdminSettings settings = await _settingsManager.GetAdminSettings();
            settings.ChartingSettings = new ChartingSettings
            {
                EnableAlarm = model.ChartingSettings.EnableAlarm,
            };

            settings.FTPSettings = new FTPSettings
            {
                Enabled = model.FTPSettings.Enabled,
                Hostname = model.FTPSettings.Hostname,
                UserName = model.FTPSettings.UserName,
                Password = model.FTPSettings.Password,
                RootPath = model.FTPSettings.RootPath
            };
            
            settings.FFTSettings = new FFTSettings
            {
                MotionThreshold = model.FFTSettings.MotionThreshold,
                MotionDelay = model.FFTSettings.MotionDelay,
                HrMagnitude = model.FFTSettings.HrMagnitude,
                SampleSize = model.FFTSettings.SampleSize,
                SampleRate = model.FFTSettings.SampleRate,
                SampleSizeRR = model.FFTSettings.SampleSizeRR,
                PresenceSampleSize = model.FFTSettings.PresenceSampleSize,
                PresenceSampleRate = model.FFTSettings.PresenceSampleRate,
                DisplayAverageSeconds = model.FFTSettings.DisplayAverageSeconds
            };

            settings.BodyDetectionSettings = new BodyDetectionSettings
            {
                EnableBodyDetect = model.BodyDetectionSettings.EnableBodyDetect,
                PresenceDetectCount = model.BodyDetectionSettings.PresenceDetectCount,
                DetectionType = model.BodyDetectionSettings.DetectionType
            };

            settings.CloudSettings = new CloudSettings
            {
                Enabled = model.CloudSettings.Enabled,
                RunDataCloudEndpoint = model.CloudSettings.RunDataCloudEndpoint
            };

            await _settingsManager.SetAdminSettings(settings);

            return Ok();
        }

        [HttpGet("vet-settings")]
        public async Task<ViewVetSettingsViewModel> GetVetSettings()
        {
            VetSettings settings = await _settingsManager.GetVetSettings();
            
            ViewVetSettingsViewModel model = new ViewVetSettingsViewModel();
            model.Name = settings.Name;
            model.Address = settings.Address;
            model.City = settings.City;
            model.State = settings.State;
            model.ZipCode = settings.ZipCode;
            model.PhoneNumber = settings.PhoneNumber;
            model.Email = settings.Email;
            model.DefaultTemperatureUnit = settings.DefaultTemperatureUnit;
            model.DefaultWeightUnit = settings.DefaultWeightUnit;

            model.DefaultAttendingDoctorId = settings.DefaultAttendingDoctorId;
            model.DefaultVetTechId = settings.DefaultVetTechId;

            return model;
        }

        [HttpPut("vet-settings")]
        public async Task<ActionResult> SetVetSettings([FromBody]UpdateVetSettingsViewModel model)
        {
            VetSettings settings = await _settingsManager.GetVetSettings();
            settings.Name = model.Name;
            settings.Address = model.Address;
            settings.City = model.City;
            settings.State = model.State;
            settings.ZipCode = model.ZipCode;
            settings.PhoneNumber = model.PhoneNumber;
            settings.Email = model.Email;
            settings.DefaultTemperatureUnit = model.DefaultTemperatureUnit;
            settings.DefaultWeightUnit = model.DefaultWeightUnit;

            settings.DefaultAttendingDoctorId = model.DefaultAttendingDoctorId;
            settings.DefaultVetTechId = model.DefaultVetTechId;

            await _settingsManager.SetVetSettings(settings);

            return Ok();
        }

        [HttpGet("vet-settings/logo")]
        public async Task<ActionResult> GetVetSettingLogo()
        {
            VetSettings settings = await _settingsManager.GetVetSettings();
            if(settings.Logo != null)
            {
                return File(settings.Logo, "image/png");
            }

            return NotFound();
        }

        [HttpPost("vet-settings/logo")]
        public async Task<ActionResult> SetVetSettingsLogo(IFormFile image)
        {
            if(image != null) 
            {
                using(Stream stream = image.OpenReadStream())
                using(MemoryStream memoryStream = new MemoryStream())
                {
                    await stream.CopyToAsync(memoryStream);
                    VetSettings settings = await _settingsManager.GetVetSettings();
                    settings.Logo = memoryStream.ToArray();
                    await _settingsManager.SetVetSettings(settings);
                }
            }

            return Ok();
        }

    }
}