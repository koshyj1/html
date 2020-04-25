namespace VetGuardian.Web.Models
{
    public class SpeciesViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int DefaultHeartRateLowAlarm { get; set; }
        public int DefaultHeartRateLowWarning { get; set; }
        public int DefaultHeartRateHighAlarm { get; set; }
        public int DefaultHeartRateHighWarning { get; set; }
        public int DefaultRespirationRateLowAlarm { get; set; }
        public int DefaultRespirationRateLowWarning { get; set; }
        public int DefaultRespirationRateHighAlarm { get; set; }
        public int DefaultRespirationRateHighWarning { get; set; }
    }
}