namespace GestionParcAuto.Domaine.Entities
{
    public class Utilisateur
    {
        public int IdUtilisateur { get; set; }
        public string NomComplet { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MotDePasseHash { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool EstActif { get; set; }
    }
}