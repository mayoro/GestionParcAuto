using GestionParcAuto.Application.DTO.Maintenance;
using GestionParcAuto.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionParcAuto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrateur")]
    public class MaintenanceController : ControllerBase
    {
        private readonly IMaintenanceService _maintenanceService;

        public MaintenanceController(IMaintenanceService maintenanceService)
        {
            _maintenanceService = maintenanceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var maintenances = await _maintenanceService.GetAllAsync();

            return Ok(maintenances);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var maintenance = await _maintenanceService.GetByIdAsync(id);

            if (maintenance is null)
            {
                return NotFound(new
                {
                    message = "Maintenance introuvable."
                });
            }

            return Ok(maintenance);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateMaintenanceDto dto)
        {
            try
            {
                var maintenanceCreee = await _maintenanceService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = maintenanceCreee.IdMaintenance },
                    maintenanceCreee
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
            [FromBody] UpdateMaintenanceDto dto)
        {
            try
            {
                dto.IdMaintenance = id;

                var modifie = await _maintenanceService.UpdateAsync(dto);

                if (!modifie)
                {
                    return NotFound(new
                    {
                        message = "Maintenance introuvable."
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
            var supprime = await _maintenanceService.DeleteAsync(id);

            if (!supprime)
            {
                return NotFound(new
                {
                    message = "Maintenance introuvable."
                });
            }

            return NoContent();
        }
    }
}