using GestionParcAuto.Domaine.Entities;

namespace GestionParcAuto.Application.Interfaces.Repositories
{
    public interface IIncidentRepository
    {
        Task<IEnumerable<Incident>> GetAllAsync();
        Task<Incident?> GetByIdAsync(int id);
        Task<Incident> AddAsync(Incident incident);
        Task<bool> UpdateAsync(Incident incident);
        Task<bool> DeleteAsync(int id);
        Task<bool> VehiculeExisteAsync(int idVehicule);
    }
}