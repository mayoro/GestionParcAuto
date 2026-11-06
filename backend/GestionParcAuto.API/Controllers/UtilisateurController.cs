using GestionParcAuto.Application.DTO.Utilisateur;
using GestionParcAuto.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace GestionParcAuto.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrateur")]
public class UtilisateurController : ControllerBase
{
    private readonly IUtilisateurService _utilisateurService;

    public UtilisateurController(IUtilisateurService utilisateurService)
    {
        _utilisateurService = utilisateurService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var utilisateurs = await _utilisateurService.GetAllAsync();
        return Ok(utilisateurs);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var utilisateur = await _utilisateurService.GetByIdAsync(id);

        if (utilisateur is null)
        {
            return NotFound(new { message = "Utilisateur introuvable." });
        }

        return Ok(utilisateur);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUtilisateurDto dto)
    {
        var utilisateurCree = await _utilisateurService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = utilisateurCree.Id },
            utilisateurCree
        );
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
    int id,
    [FromBody] UpdateUtilisateurDto dto)
    {
        dto.Id = id;

        var modifie = await _utilisateurService.UpdateAsync(dto);

        if (!modifie)
        {
            return NotFound(new { message = "Utilisateur introuvable." });
        }

        return NoContent();
    }


    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var supprime = await _utilisateurService.DeleteAsync(id);

        if (!supprime)
        {
            return NotFound(new { message = "Utilisateur introuvable." });
        }

        return NoContent();
    }
}