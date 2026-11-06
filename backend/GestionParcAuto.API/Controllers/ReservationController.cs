using GestionParcAuto.Application.DTO.Reservation;
using GestionParcAuto.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestionParcAuto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrateur")]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public ReservationController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reservations = await _reservationService.GetAllAsync();

            return Ok(reservations);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var reservation = await _reservationService.GetByIdAsync(id);

            if (reservation is null)
            {
                return NotFound(new
                {
                    message = "Réservation introuvable."
                });
            }

            return Ok(reservation);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateReservationDto dto)
        {
            try
            {
                var reservationCreee = await _reservationService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = reservationCreee.IdReservation },
                    reservationCreee);
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
            [FromBody] UpdateReservationDto dto)
        {
            try
            {
                dto.IdReservation = id;

                var modifie = await _reservationService.UpdateAsync(dto);

                if (!modifie)
                {
                    return NotFound(new
                    {
                        message = "Réservation introuvable."
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
            var supprime = await _reservationService.DeleteAsync(id);

            if (!supprime)
            {
                return NotFound(new
                {
                    message = "Réservation introuvable."
                });
            }

            return NoContent();
        }
    }
}