using GestionParcAuto.Application.DTO.Utilisateur;


namespace GestionParcAuto.Application.Interfaces.Services
{
    public interface IUtilisateurService
    {
        Task<IEnumerable<UtilisateurDto>> GetAllAsync();
        Task<UtilisateurDto?> GetByIdAsync(int id);
        Task<UtilisateurDto> CreateAsync(CreateUtilisateurDto dto);
        Task<bool> UpdateAsync(UpdateUtilisateurDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
