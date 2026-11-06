using GestionParcAuto.Application.Interfaces.Repositories;
using GestionParcAuto.Domaine.Entities;
using GestionParcAuto.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestionParcAuto.Infrastructure.Repositories
{
    public class MaintenanceRepository : IMaintenanceRepository
    {
        private readonly GestionParcAutoDbContext _context;

        public MaintenanceRepository(GestionParcAutoDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Maintenance>> GetAllAsync()
        {
            return await _context.Maintenances
                .AsNoTracking()
                .Include(m => m.Vehicule)
                .OrderByDescending(m => m.DateMaintenance)
                .ToListAsync();
        }

        public async Task<Maintenance?> GetByIdAsync(int id)
        {
            return await _context.Maintenances
                .Include(m => m.Vehicule)
                .FirstOrDefaultAsync(m => m.IdMaintenance == id);
        }

        public async Task<Maintenance> AddAsync(Maintenance maintenance)
        {
            _context.Maintenances.Add(maintenance);
            await _context.SaveChangesAsync();

            return maintenance;
        }

        public async Task<bool> UpdateAsync(Maintenance maintenance)
        {
            var existe = await _context.Maintenances
                .AnyAsync(m => m.IdMaintenance == maintenance.IdMaintenance);

            if (!existe)
            {
                return false;
            }

            _context.Maintenances.Update(maintenance);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var maintenance = await _context.Maintenances.FindAsync(id);

            if (maintenance is null)
            {
                return false;
            }

            _context.Maintenances.Remove(maintenance);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> VehiculeExisteAsync(int idVehicule)
        {
            return await _context.Vehicules
                .AnyAsync(v => v.IdVehicule == idVehicule);
        }

        public async Task<bool> PossedeMaintenanceEnCoursAsync(int idVehicule)
        {
            return await _context.Maintenances.AnyAsync(m =>
                m.IdVehicule == idVehicule &&
                m.Statut == "En cours");
        }
    }
}