using System.ComponentModel.DataAnnotations;

namespace GestionParcAuto.Application.DTO.Utilisateur
{
    public class UpdateUtilisateurDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string NomComplet { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;

        public bool EstActif { get; set; }
    }
}
