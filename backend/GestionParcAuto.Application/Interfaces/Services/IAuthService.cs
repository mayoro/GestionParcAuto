using GestionParcAuto.Application.DTO.Utilisateur;

namespace GestionParcAuto.Application.Interfaces.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
}