using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using VetGuardian.Core.Enumeration;
using VetGuardian.Core.Models;

namespace VetGuardian.Web.Controllers
{
    [Route("api/[controller]")]
    public class WeightsController : Controller
    {
        [HttpGet]
        public IEnumerable<Enumeration> GetAll()
        {
            return EnumExtensions.GetValues<WeightUnit>().Select(t => new Enumeration
            { 
                Id = (int)t, 
                Name = t.GetDisplayName(),
                Initials = t.GetDisplayDescription()
            }).ToList();
        }
    }
}