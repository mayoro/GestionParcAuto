using GestionParcAuto.Application.DTO.Utilisateur;
using GestionParcAuto.Application.Interfaces.Repositories;
using GestionParcAuto.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GestionParcAuto.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUtilisateurRepository _utilisateurRepository;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUtilisateurRepository utilisateurRepository,
        IConfiguration configuration)
    {
        _utilisateurRepository = utilisateurRepository;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
    {
        var utilisateur = await _utilisateurRepository.GetByEmailAsync(dto.Email);

        if (utilisateur is null ||
            !utilisateur.EstActif ||
            !BCrypt.Net.BCrypt.Verify(dto.MotDePasse, utilisateur.MotDePasseHash))
        {
            return null;
        }

        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("La clé JWT est introuvable.");

        var jwtIssuer = _configuration["Jwt:Issuer"];
        var jwtAudience = _configuration["Jwt:Audience"];
        var duration = _configuration.GetValue<int>("Jwt:DurationInMinutes");

        var expiration = DateTime.UtcNow.AddMinutes(duration);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, utilisateur.IdUtilisateur.ToString()),
            new(ClaimTypes.Name, utilisateur.NomComplet),
            new(ClaimTypes.Email, utilisateur.Email),
            new(ClaimTypes.Role, utilisateur.Role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        );

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: expiration,
            signingCredentials: credentials
        );

        return new LoginResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Expiration = expiration,
            Utilisateur = new UtilisateurDto
            {
                Id = utilisateur.IdUtilisateur,
                NomComplet = utilisateur.NomComplet,
                Email = utilisateur.Email,
                Role = utilisateur.Role,
                EstActif = utilisateur.EstActif
            }
        };
    }
}