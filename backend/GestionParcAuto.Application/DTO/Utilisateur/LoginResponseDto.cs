namespace GestionParcAuto.Application.DTO.Utilisateur;

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;

    public DateTime Expiration { get; set; }

    public UtilisateurDto Utilisateur { get; set; } = new();
}
