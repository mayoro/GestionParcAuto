using GestionParcAuto.Application.Interfaces.Repositories;
using GestionParcAuto.Domaine.Entities;
using GestionParcAuto.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestionParcAuto.Infrastructure.Repositories
{
    public class ReservationRepository : IReservationRepository
    {
        private readonly GestionParcAutoDbContext _context;

        public ReservationRepository(GestionParcAutoDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Reservation>> GetAllAsync()
        {
            return await _context.Reservations
                .AsNoTracking()
                .Include(r => r.Utilisateur)
                .Include(r => r.Vehicule)
                .OrderByDescending(r => r.DateDebut)
                .ToListAsync();
        }

        public async Task<Reservation?> GetByIdAsync(int id)
        {
            return await _context.Reservations
                .Include(r => r.Utilisateur)
                .Include(r => r.Vehicule)
                .FirstOrDefaultAsync(r => r.IdReservation == id);
        }

        public async Task<Reservation> AddAsync(Reservation reservation)
        {
            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return reservation;
        }

        public async Task<bool> UpdateAsync(Reservation reservation)
        {
            var existe = await _context.Reservations
                .AnyAsync(r => r.IdReservation == reservation.IdReservation);

            if (!existe)
            {
                return false;
            }

            _context.Reservations.Update(reservation);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);

            if (reservation is null)
            {
                return false;
            }

            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UtilisateurExisteAsync(int idUtilisateur)
        {
            return await _context.Utilisateurs
                .AnyAsync(u => u.IdUtilisateur == idUtilisateur);
        }

        public async Task<bool> VehiculeExisteAsync(int idVehicule)
        {
            return await _context.Vehicules
                .AnyAsync(v => v.IdVehicule == idVehicule);
        }

        public async Task<bool> PossedeConflitAsync(
            int idVehicule,
            DateTime dateDebut,
            DateTime dateFin,
            int? idReservationExclue = null)
        {
            return await _context.Reservations.AnyAsync(r =>
                r.IdVehicule == idVehicule &&
                (r.Statut == "Confirmée" || r.Statut == "En cours") &&
                (!idReservationExclue.HasValue ||
                 r.IdReservation != idReservationExclue.Value) &&
                r.DateDebut < dateFin &&
                r.DateFin > dateDebut);
        }

        public async Task<bool> PossedeReservationActiveAsync(int idVehicule)
        {
            return await _context.Reservations.AnyAsync(r =>
                r.IdVehicule == idVehicule &&
                (r.Statut == "Confirmée" || r.Statut == "En cours"));
        }
    }
}