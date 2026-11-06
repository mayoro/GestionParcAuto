using GestionParcAuto.Application.Interfaces.Repositories;
using GestionParcAuto.Domaine.Entities;
using GestionParcAuto.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestionParcAuto.Infrastructure.Repositories
{
    public class VehiculeRepository : IVehiculeRepository
    {
        private readonly GestionParcAutoDbContext _context;

        public VehiculeRepository(GestionParcAutoDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Vehicule>> GetAllAsync()
        {
            return await _context.Vehicules
                .AsNoTracking()
                .OrderBy(v => v.Immatriculation)
                .ToListAsync();
        }

        public async Task<Vehicule?> GetByIdAsync(int id)
        {
            return await _context.Vehicules.FindAsync(id);
        }

        public async Task<Vehicule?> GetByImmatriculationAsync(
            string immatriculation)
        {
            return await _context.Vehicules
                .FirstOrDefaultAsync(v =>
                    v.Immatriculation == immatriculation);
        }

        public async Task<Vehicule> AddAsync(Vehicule vehicule)
        {
            _context.Vehicules.Add(vehicule);
            await _context.SaveChangesAsync();

            return vehicule;
        }

        public async Task<bool> UpdateAsync(Vehicule vehicule)
        {
            var existe = await _context.Vehicules
                .AnyAsync(v => v.IdVehicule == vehicule.IdVehicule);

            if (!existe)
            {
                return false;
            }

            _context.Vehicules.Update(vehicule);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var vehicule = await _context.Vehicules.FindAsync(id);

            if (vehicule is null)
            {
                return false;
            }

            _context.Vehicules.Remove(vehicule);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}