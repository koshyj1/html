using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using VetGuardian.Core.Enumeration;
using VetGuardian.Core.Models;
using VetGuardian.Web.Models;

namespace VetGuardian.Web.Controllers
{
    [Route("api/[controller]")]
    public class SpeciesController : Controller
    {
        [HttpGet]
        public IEnumerable<SpeciesViewModel> GetAll()
        {
            List<SpeciesViewModel> result = new List<SpeciesViewModel>();

            foreach(Species species in EnumExtensions.GetValues<Species>())
            {
                SpeciesViewModel model = new SpeciesViewModel
                {
                    Id = (int)species,
                    Name = species.GetDisplayName()
                };

                switch(species)
                {
                    case Species.Puppy:
                            model.DefaultHeartRateLowAlarm = 70;
                            model.DefaultHeartRateLowWarning = 100;
                            model.DefaultHeartRateHighWarning = 160;
                            model.DefaultHeartRateHighAlarm = 185;

                            model.DefaultRespirationRateLowAlarm = 10;
                            model.DefaultRespirationRateLowWarning = 15;
                            model.DefaultRespirationRateHighWarning = 28;
                            model.DefaultRespirationRateHighAlarm = 35;
                            break;

                    case Species.SmallDog:
                            model.DefaultHeartRateLowAlarm = 60;
                            model.DefaultHeartRateLowWarning = 90;
                            model.DefaultHeartRateHighWarning = 120;
                            model.DefaultHeartRateHighAlarm = 150;

                            model.DefaultRespirationRateLowAlarm = 10;
                            model.DefaultRespirationRateLowWarning = 15;
                            model.DefaultRespirationRateHighWarning = 28;
                            model.DefaultRespirationRateHighAlarm = 35;
                            break;

                    case Species.MediumDog:
                            model.DefaultHeartRateLowAlarm = 50;
                            model.DefaultHeartRateLowWarning = 70;
                            model.DefaultHeartRateHighWarning = 110;
                            model.DefaultHeartRateHighAlarm = 125;

                            model.DefaultRespirationRateLowAlarm = 10;
                            model.DefaultRespirationRateLowWarning = 15;
                            model.DefaultRespirationRateHighWarning = 28;
                            model.DefaultRespirationRateHighAlarm = 35;
                            break;

                    case Species.LargeDog:
                            model.DefaultHeartRateLowAlarm = 45;
                            model.DefaultHeartRateLowWarning = 60;
                            model.DefaultHeartRateHighWarning = 90;
                            model.DefaultHeartRateHighAlarm = 110;

                            model.DefaultRespirationRateLowAlarm = 10;
                            model.DefaultRespirationRateLowWarning = 15;
                            model.DefaultRespirationRateHighWarning = 28;
                            model.DefaultRespirationRateHighAlarm = 35;
                            break;

                    case Species.Kitten:
                            model.DefaultHeartRateLowAlarm = 120;
                            model.DefaultHeartRateLowWarning = 140;
                            model.DefaultHeartRateHighWarning = 220;
                            model.DefaultHeartRateHighAlarm = 240;

                            model.DefaultRespirationRateLowAlarm = 10;
                            model.DefaultRespirationRateLowWarning = 18;
                            model.DefaultRespirationRateHighWarning = 30;
                            model.DefaultRespirationRateHighAlarm = 38;
                            break;

                    case Species.SmallCat:
                            model.DefaultHeartRateLowAlarm = 100;
                            model.DefaultHeartRateLowWarning = 120;
                            model.DefaultHeartRateHighWarning = 200;
                            model.DefaultHeartRateHighAlarm = 220;

                            model.DefaultRespirationRateLowAlarm = 10;
                            model.DefaultRespirationRateLowWarning = 18;
                            model.DefaultRespirationRateHighWarning = 30;
                            model.DefaultRespirationRateHighAlarm = 38;
                            break;

                    case Species.MediumCat:
                            model.DefaultHeartRateLowAlarm = 100;
                            model.DefaultHeartRateLowWarning = 120;
                            model.DefaultHeartRateHighWarning = 200;
                            model.DefaultHeartRateHighAlarm = 220;

                            model.DefaultRespirationRateLowAlarm = 10;
                            model.DefaultRespirationRateLowWarning = 18;
                            model.DefaultRespirationRateHighWarning = 30;
                            model.DefaultRespirationRateHighAlarm = 38;
                            break;

                    case Species.LargeCat:
                            model.DefaultHeartRateLowAlarm = 100;
                            model.DefaultHeartRateLowWarning = 120;
                            model.DefaultHeartRateHighWarning = 200;
                            model.DefaultHeartRateHighAlarm = 220;

                            model.DefaultRespirationRateLowAlarm = 10;
                            model.DefaultRespirationRateLowWarning = 18;
                            model.DefaultRespirationRateHighWarning = 30;
                            model.DefaultRespirationRateHighAlarm = 38;
                            break;

                    case Species.Vik:
                            model.DefaultHeartRateLowAlarm = 65;
                            model.DefaultHeartRateLowWarning = 70;
                            model.DefaultHeartRateHighWarning = 80;
                            model.DefaultHeartRateHighAlarm = 90;

                            model.DefaultRespirationRateLowAlarm = 12;
                            model.DefaultRespirationRateLowWarning = 15;
                            model.DefaultRespirationRateHighWarning = 20;
                            model.DefaultRespirationRateHighAlarm = 24;
                            break;
                }

                result.Add(model);
            }

            return result;
        }
    }
}