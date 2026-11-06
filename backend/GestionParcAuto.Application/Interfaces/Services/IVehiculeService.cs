using GestionParcAuto.Application.DTO.Vehicule;

namespace GestionParcAuto.Application.Interfaces.Services
{
    public interface IVehiculeService
    {
        Task<IEnumerable<VehiculeDto>> GetAllAsync();
        Task<VehiculeDto?> GetByIdAsync(int id);
        Task<VehiculeDto> CreateAsync(CreateVehiculeDto dto);
        Task<bool> UpdateAsync(UpdateVehiculeDto dto);
        Task<bool> DeleteAsync(int id);
    }
}