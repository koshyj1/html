using System;
using System.Collections.Generic;
using System.Linq;
using VetGuardian.Core.Models;
using VetGuardian.Core.Query;

namespace VetGuardian.Web.Models
{
    public class RunViewModel
{   
        public Run Run { get; set; }
        public Staff AttendingDoctor { get; set; }
        public Staff VetTech { get; set; }
        public Patient Patient { get; set; }
    }

    public class PDFTemplateViewModel
    {
        public Run Run { get; set; }
        public Staff AttendingDoctor { get; set; }
        public Staff VetTech { get; set; }
        public Patient Patient { get; set; }
        public VetSettings VetSettings { get; set; }
        public List<RunData> Data { get; set; }
        public List<RunLog> Log { get; set; }
        public Version Version { get; set; }
        public List<RunData> Images { get; set; }

        public double CalculateAverageHR()
        {
            if(!Data.Any())
            {
                return 0;
            }

            return Data.Average(t => t.HeartRate);
        }

        public double CalculateAverageRR()
        {
            if (!Data.Any())
            {
                return 0;
            }

            return Data.Average(t => t.RespirationRate);
        }

        public TimeSpan CalculateDuration()
        {
            return GetEndTime() - Run.Timestamp ?? TimeSpan.FromSeconds(0);
        }

        public DateTime? GetEndTime()
        {
            if(!Data.Any())
            {
                return null;
            }

            return Data.Last().Timestamp;
        }
    }
}