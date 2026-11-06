using GestionParcAuto.Domaine.Entities;

namespace GestionParcAuto.Application.Interfaces.Repositories
{
    public interface IVehiculeRepository
    {
        Task<IEnumerable<Vehicule>> GetAllAsync();
        Task<Vehicule?> GetByIdAsync(int id);
        Task<Vehicule?> GetByImmatriculationAsync(string immatriculation);
        Task<Vehicule> AddAsync(Vehicule vehicule);
        Task<bool> UpdateAsync(Vehicule vehicule);
        Task<bool> DeleteAsync(int id);
    }
}