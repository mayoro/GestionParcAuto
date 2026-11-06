namespace GestionParcAuto.Application.DTO.Utilisateur
{
    public class UtilisateurDto
    {
        public int Id { get; set; }
        public string NomComplet { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool EstActif { get; set; }
    }
}
