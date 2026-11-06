using GestionParcAuto.Application.DTO.Incident;
using GestionParcAuto.Application.Interfaces.Repositories;
using GestionParcAuto.Application.Interfaces.Services;
using GestionParcAuto.Domaine.Entities;

namespace GestionParcAuto.Application.Services
{
    public class IncidentService : IIncidentService
    {
        private readonly IIncidentRepository _incidentRepository;

        private static readonly string[] GravitesValides =
        {
            "Faible",
            "Moyenne",
            "Élevée"
        };

        private static readonly string[] StatutsValides =
        {
            "Ouvert",
            "En cours",
            "Résolu"
        };

        public IncidentService(IIncidentRepository incidentRepository)
        {
            _incidentRepository = incidentRepository;
        }

        public async Task<IEnumerable<IncidentDto>> GetAllAsync()
        {
            var incidents = await _incidentRepository.GetAllAsync();

            return incidents.Select(VersDto);
        }

        public async Task<IncidentDto?> GetByIdAsync(int id)
        {
            var incident = await _incidentRepository.GetByIdAsync(id);

            return incident is null ? null : VersDto(incident);
        }

        public async Task<IncidentDto> CreateAsync(CreateIncidentDto dto)
        {
            await VerifierDonneesAsync(
                dto.TypeIncident,
                dto.Description,
                dto.Gravite,
                dto.IdVehicule);

            var incident = new Incident
            {
                TypeIncident = dto.TypeIncident.Trim(),
                Description = dto.Description.Trim(),
                Gravite = dto.Gravite.Trim(),
                DateIncident = dto.DateIncident,
                IdVehicule = dto.IdVehicule,
                Statut = "Ouvert"
            };

            var incidentCree = await _incidentRepository.AddAsync(incident);

            var incidentComplet = await _incidentRepository
                .GetByIdAsync(incidentCree.Id);

            return VersDto(incidentComplet!);
        }

        public async Task<bool> UpdateAsync(UpdateIncidentDto dto)
        {
            var incident = await _incidentRepository.GetByIdAsync(dto.Id);

            if (incident is null)
            {
                return false;
            }

            await VerifierDonneesAsync(
                dto.TypeIncident,
                dto.Description,
                dto.Gravite,
                dto.IdVehicule);

            var statut = dto.Statut.Trim();

            if (!StatutsValides.Contains(statut))
            {
                throw new InvalidOperationException(
                    "Le statut de l’incident est invalide."
                );
            }

            incident.TypeIncident = dto.TypeIncident.Trim();
            incident.Description = dto.Description.Trim();
            incident.Gravite = dto.Gravite.Trim();
            incident.DateIncident = dto.DateIncident;
            incident.Statut = statut;
            incident.IdVehicule = dto.IdVehicule;

            return await _incidentRepository.UpdateAsync(incident);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _incidentRepository.DeleteAsync(id);
        }

        private async Task VerifierDonneesAsync(
            string typeIncident,
            string description,
            string gravite,
            int idVehicule)
        {
            if (string.IsNullOrWhiteSpace(typeIncident))
            {
                throw new InvalidOperationException(
                    "Le type d’incident est obligatoire."
                );
            }

            if (string.IsNullOrWhiteSpace(description))
            {
                throw new InvalidOperationException(
                    "La description est obligatoire."
                );
            }

            if (!GravitesValides.Contains(gravite.Trim()))
            {
                throw new InvalidOperationException(
                    "La gravité de l’incident est invalide."
                );
            }

            if (!await _incidentRepository.VehiculeExisteAsync(idVehicule))
            {
                throw new InvalidOperationException(
                    "Véhicule introuvable."
                );
            }
        }

        private static IncidentDto VersDto(Incident incident)
        {
            var vehicule = incident.Vehicule is null
                ? "Véhicule inconnu"
                : $"{incident.Vehicule.Immatriculation} - " +
                  $"{incident.Vehicule.Marque} " +
                  $"{incident.Vehicule.Modele}";

            return new IncidentDto
            {
                Id = incident.Id,
                TypeIncident = incident.TypeIncident,
                Description = incident.Description,
                Gravite = incident.Gravite,
                DateIncident = incident.DateIncident,
                Statut = incident.Statut,
                IdVehicule = incident.IdVehicule,
                Vehicule = vehicule
            };
        }
    }
}
