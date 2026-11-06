using GestionParcAuto.Application.DTO.Maintenance;

namespace GestionParcAuto.Application.Interfaces.Services
{
    public interface IMaintenanceService
    {
        Task<IEnumerable<MaintenanceDto>> GetAllAsync();
        Task<MaintenanceDto?> GetByIdAsync(int id);
        Task<MaintenanceDto> CreateAsync(CreateMaintenanceDto dto);
        Task<bool> UpdateAsync(UpdateMaintenanceDto dto);
        Task<bool> DeleteAsync(int id);
    }
}