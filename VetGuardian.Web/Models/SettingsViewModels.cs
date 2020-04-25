using System.ComponentModel.DataAnnotations;
using VetGuardian.Core.Enumeration;
using VetGuardian.Core.Models;

namespace VetGuardian.Web.Models
{
    public class UpdateAdminSettingsViewModel
    {
        public ChartingSettings ChartingSettings { get; set; }
        public FTPSettings FTPSettings { get; set; }
        public FFTSettings FFTSettings { get; set; }
        public BodyDetectionSettings BodyDetectionSettings { get; set; }
        public CloudSettings CloudSettings { get; set; }

        public UpdateAdminSettingsViewModel()
        {
            ChartingSettings = new ChartingSettings();
            FTPSettings = new FTPSettings();
            FFTSettings = new FFTSettings();
            BodyDetectionSettings = new BodyDetectionSettings();
            CloudSettings = new CloudSettings();
        }
    }

    public class UpdateVetSettingsViewModel
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public TemperatureUnit DefaultTemperatureUnit { get; set; }
        public WeightUnit DefaultWeightUnit {get;set;}
        public string DefaultAttendingDoctorId { get; set; }
        public string DefaultVetTechId { get; set; }
    }
    
    public class ViewVetSettingsViewModel
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public TemperatureUnit DefaultTemperatureUnit { get; set; }
        public WeightUnit DefaultWeightUnit {get;set;}

        public string DefaultAttendingDoctorId { get; set; }
        public string DefaultVetTechId { get; set; }
    }
}