using GestionParcAuto.Application.DTO.Vehicule;
using GestionParcAuto.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionParcAuto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrateur")]
    public class VehiculeController : ControllerBase
    {
        private readonly IVehiculeService _vehiculeService;

        public VehiculeController(IVehiculeService vehiculeService)
        {
            _vehiculeService = vehiculeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vehicules = await _vehiculeService.GetAllAsync();

            return Ok(vehicules);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var vehicule = await _vehiculeService.GetByIdAsync(id);

            if (vehicule is null)
            {
                return NotFound(new
                {
                    message = "Véhicule introuvable."
                });
            }

            return Ok(vehicule);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateVehiculeDto dto)
        {
            try
            {
                var vehiculeCree = await _vehiculeService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = vehiculeCree.IdVehicule },
                    vehiculeCree
                );
            }
            catch (InvalidOperationException exception)
            {
                return Conflict(new
                {
                    message = exception.Message
                });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateVehiculeDto dto)
        {
            try
            {
                dto.IdVehicule = id;

                var modifie = await _vehiculeService.UpdateAsync(dto);

                if (!modifie)
                {
                    return NotFound(new
                    {
                        message = "Véhicule introuvable."
                    });
                }

                return NoContent();
            }
            catch (InvalidOperationException exception)
            {
                return Conflict(new
                {
                    message = exception.Message
                });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var supprime = await _vehiculeService.DeleteAsync(id);

            if (!supprime)
            {
                return NotFound(new
                {
                    message = "Véhicule introuvable."
                });
            }

            return NoContent();
        }
    }
}
