using GestionParcAuto.Domaine.Entities;

namespace GestionParcAuto.Application.Interfaces.Repositories
{
    public interface IReservationRepository
    {
        Task<IEnumerable<Reservation>> GetAllAsync();
        Task<Reservation?> GetByIdAsync(int id);
        Task<Reservation> AddAsync(Reservation reservation);
        Task<bool> UpdateAsync(Reservation reservation);
        Task<bool> DeleteAsync(int id);

        Task<bool> UtilisateurExisteAsync(int idUtilisateur);
        Task<bool> VehiculeExisteAsync(int idVehicule);

        Task<bool> PossedeConflitAsync(
            int idVehicule,
            DateTime dateDebut,
            DateTime dateFin,
            int? idReservationExclue = null);

        Task<bool> PossedeReservationActiveAsync(int idVehicule);
    }
}