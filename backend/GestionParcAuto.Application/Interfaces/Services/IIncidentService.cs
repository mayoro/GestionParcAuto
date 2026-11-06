using GestionParcAuto.Application.DTO.Incident;

namespace GestionParcAuto.Application.Interfaces.Services
{
    public interface IIncidentService
    {
        Task<IEnumerable<IncidentDto>> GetAllAsync();
        Task<IncidentDto?> GetByIdAsync(int id);
        Task<IncidentDto> CreateAsync(CreateIncidentDto dto);
        Task<bool> UpdateAsync(UpdateIncidentDto dto);
        Task<bool> DeleteAsync(int id);
    }
}