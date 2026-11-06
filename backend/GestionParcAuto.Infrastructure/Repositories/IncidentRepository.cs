using GestionParcAuto.Application.Interfaces.Repositories;
using GestionParcAuto.Domaine.Entities;
using GestionParcAuto.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestionParcAuto.Infrastructure.Repositories
{
    public class IncidentRepository : IIncidentRepository
    {
        private readonly GestionParcAutoDbContext _context;

        public IncidentRepository(GestionParcAutoDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Incident>> GetAllAsync()
        {
            return await _context.Incidents
                .AsNoTracking()
                .Include(i => i.Vehicule)
                .OrderByDescending(i => i.DateIncident)
                .ToListAsync();
        }

        public async Task<Incident?> GetByIdAsync(int id)
        {
            return await _context.Incidents
                .Include(i => i.Vehicule)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<Incident> AddAsync(Incident incident)
        {
            _context.Incidents.Add(incident);
            await _context.SaveChangesAsync();

            return incident;
        }

        public async Task<bool> UpdateAsync(Incident incident)
        {
            var existe = await _context.Incidents
                .AnyAsync(i => i.Id == incident.Id);

            if (!existe)
            {
                return false;
            }

            _context.Incidents.Update(incident);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var incident = await _context.Incidents.FindAsync(id);

            if (incident is null)
            {
                return false;
            }

            _context.Incidents.Remove(incident);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> VehiculeExisteAsync(int idVehicule)
        {
            return await _context.Vehicules
                .AnyAsync(v => v.IdVehicule == idVehicule);
        }
    }
}
