using GestionParcAuto.Domaine.Entities;

namespace GestionParcAuto.Application.Interfaces.Repositories
{
    public interface IUtilisateurRepository
    {
        Task<IEnumerable<Utilisateur>> GetAllAsync();
        Task<Utilisateur?> GetByIdAsync(int id);
        Task<Utilisateur?> GetByEmailAsync(string email);
        Task AddAsync(Utilisateur utilisateur);
        Task UpdateAsync(Utilisateur utilisateur);
        Task DeleteAsync(Utilisateur utilisateur);
    }
}
