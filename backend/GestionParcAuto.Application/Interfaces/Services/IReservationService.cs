using GestionParcAuto.Application.DTO.Reservation;

namespace GestionParcAuto.Application.Interfaces.Services
{
    public interface IReservationService
    {
        Task<IEnumerable<ReservationDto>> GetAllAsync();
        Task<ReservationDto?> GetByIdAsync(int id);
        Task<ReservationDto> CreateAsync(CreateReservationDto dto);
        Task<bool> UpdateAsync(UpdateReservationDto dto);
        Task<bool> DeleteAsync(int id);
    }
}