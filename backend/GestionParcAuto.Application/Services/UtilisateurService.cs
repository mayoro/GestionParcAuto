using GestionParcAuto.Application.DTO.Utilisateur;
using GestionParcAuto.Application.Interfaces.Repositories;
using GestionParcAuto.Application.Interfaces.Services;
using GestionParcAuto.Domaine.Entities;

namespace GestionParcAuto.Application.Services
{
    public class UtilisateurService : IUtilisateurService
    {
        private readonly IUtilisateurRepository _utilisateurRepository;

        public UtilisateurService(IUtilisateurRepository utilisateurRepository)
        {
            _utilisateurRepository = utilisateurRepository;
        }

        public async Task<IEnumerable<UtilisateurDto>> GetAllAsync()
        {
            var utilisateurs = await _utilisateurRepository.GetAllAsync();

            return utilisateurs.Select(u => new UtilisateurDto
            {
                Id = u.IdUtilisateur,
                NomComplet = u.NomComplet,
                Email = u.Email,
                Role = u.Role,
                EstActif = u.EstActif
            });
        }

        public async Task<UtilisateurDto?> GetByIdAsync(int id)
        {
            var utilisateur = await _utilisateurRepository.GetByIdAsync(id);

            if (utilisateur is null)
                return null;

            // Suppression du "!" inutile car le null a déjà été vérifié
            return new UtilisateurDto
            {
                Id = utilisateur.IdUtilisateur,
                NomComplet = utilisateur.NomComplet,
                Email = utilisateur.Email,
                Role = utilisateur.Role,
                EstActif = utilisateur.EstActif
            };
        }

        public async Task<UtilisateurDto> CreateAsync(CreateUtilisateurDto dto)
        {
            var utilisateurExiste = await _utilisateurRepository.GetByEmailAsync(dto.Email);

            if (utilisateurExiste != null)
                throw new Exception("Un utilisateur avec cet email existe déjà.");

            var utilisateur = new Utilisateur
            {
                NomComplet = dto.NomComplet,
                Email = dto.Email,
                MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(dto.MotDePasse),
                Role = dto.Role,
                EstActif = dto.EstActif
            };

            await _utilisateurRepository.AddAsync(utilisateur);

            return new UtilisateurDto
            {
                Id = utilisateur.IdUtilisateur,
                NomComplet = utilisateur.NomComplet,
                Email = utilisateur.Email,
                Role = utilisateur.Role,
                EstActif = utilisateur.EstActif
            };
        }

        public async Task<bool> UpdateAsync(UpdateUtilisateurDto dto)
        {
            var utilisateur = await _utilisateurRepository.GetByIdAsync(dto.Id);

            if (utilisateur == null)
                return false;

            utilisateur.NomComplet = dto.NomComplet;
            utilisateur.Email = dto.Email;
            utilisateur.Role = dto.Role;
            utilisateur.EstActif = dto.EstActif;

            await _utilisateurRepository.UpdateAsync(utilisateur);
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var utilisateur = await _utilisateurRepository.GetByIdAsync(id);

            if (utilisateur == null)
                return false;

            await _utilisateurRepository.DeleteAsync(utilisateur);
            return true;
        }
    }
}