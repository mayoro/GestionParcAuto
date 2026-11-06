using GestionParcAuto.Domaine.Entities;

namespace GestionParcAuto.Application.Interfaces.Repositories
{
    public interface IMaintenanceRepository
    {
        Task<IEnumerable<Maintenance>> GetAllAsync();
        Task<Maintenance?> GetByIdAsync(int id);
        Task<Maintenance> AddAsync(Maintenance maintenance);
        Task<bool> UpdateAsync(Maintenance maintenance);
        Task<bool> DeleteAsync(int id);
        Task<bool> VehiculeExisteAsync(int idVehicule);

        Task<bool> PossedeMaintenanceEnCoursAsync(int idVehicule);
    }
}