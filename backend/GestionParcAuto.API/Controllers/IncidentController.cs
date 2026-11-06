using GestionParcAuto.Application.DTO.Incident;
using GestionParcAuto.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionParcAuto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrateur")]
    public class IncidentController : ControllerBase
    {
        private readonly IIncidentService _incidentService;

        public IncidentController(IIncidentService incidentService)
        {
            _incidentService = incidentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var incidents = await _incidentService.GetAllAsync();

            return Ok(incidents);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var incident = await _incidentService.GetByIdAsync(id);

            if (incident is null)
            {
                return NotFound(new
                {
                    message = "Incident introuvable."
                });
            }

            return Ok(incident);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateIncidentDto dto)
        {
            try
            {
                var incidentCree = await _incidentService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = incidentCree.Id },
                    incidentCree
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
            [FromBody] UpdateIncidentDto dto)
        {
            try
            {
                dto.Id = id;

                var modifie = await _incidentService.UpdateAsync(dto);

                if (!modifie)
                {
                    return NotFound(new
                    {
                        message = "Incident introuvable."
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
            var supprime = await _incidentService.DeleteAsync(id);

            if (!supprime)
            {
                return NotFound(new
                {
                    message = "Incident introuvable."
                });
            }

            return NoContent();
        }
    }
}