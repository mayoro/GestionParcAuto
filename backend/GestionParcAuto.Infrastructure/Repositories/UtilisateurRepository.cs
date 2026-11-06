using GestionParcAuto.Application.Interfaces.Repositories;
using GestionParcAuto.Domaine.Entities;
using GestionParcAuto.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestionParcAuto.Infrastructure.Repositories
{
    //public class UtilisateurRepository
    public class UtilisateurRepository : IUtilisateurRepository
    {
        private readonly GestionParcAutoDbContext _context;

        public UtilisateurRepository(GestionParcAutoDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Utilisateur>> GetAllAsync()
        {
            return await _context.Utilisateurs.ToListAsync();
        }

        public async Task<Utilisateur?> GetByIdAsync(int id)
        {
            return await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.IdUtilisateur == id);
        }

        public async Task<Utilisateur?> GetByEmailAsync(string email)
        {
            return await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task AddAsync(Utilisateur utilisateur)
        {
            await _context.Utilisateurs.AddAsync(utilisateur);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Utilisateur utilisateur)
        {
            _context.Utilisateurs.Update(utilisateur);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var utilisateur = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.IdUtilisateur == id);

            if (utilisateur != null)
            {
                _context.Utilisateurs.Remove(utilisateur);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(Utilisateur utilisateur)
        {
            _context.Utilisateurs.Remove(utilisateur);
            await _context.SaveChangesAsync();
        }
    }
}