using GestionParcAuto.Application.DTO.Maintenance;
using GestionParcAuto.Application.Interfaces.Repositories;
using GestionParcAuto.Application.Interfaces.Services;
using GestionParcAuto.Domaine.Entities;

namespace GestionParcAuto.Application.Services
{
    public class MaintenanceService : IMaintenanceService
    {
        private readonly IMaintenanceRepository _maintenanceRepository;
        private readonly IStatutVehiculeService _statutVehiculeService;

        private static readonly string[] StatutsValides =
        {
            "Planifiée",
            "En cours",
            "Terminée",
            "Annulée"
        };

        public MaintenanceService(
    IMaintenanceRepository maintenanceRepository,
    IStatutVehiculeService statutVehiculeService)
        {
            _maintenanceRepository = maintenanceRepository;
            _statutVehiculeService = statutVehiculeService;
        }

        public async Task<IEnumerable<MaintenanceDto>> GetAllAsync()
        {
            var maintenances = await _maintenanceRepository.GetAllAsync();

            return maintenances.Select(VersDto);
        }

        public async Task<MaintenanceDto?> GetByIdAsync(int id)
        {
            var maintenance = await _maintenanceRepository.GetByIdAsync(id);

            return maintenance is null ? null : VersDto(maintenance);
        }

        public async Task<MaintenanceDto> CreateAsync(CreateMaintenanceDto dto)
        {
            await VerifierDonneesAsync(
                dto.TypeIntervention,
                dto.Description,
                dto.Cout,
                dto.IdVehicule);

            var maintenance = new Maintenance
            {
                TypeIntervention = dto.TypeIntervention.Trim(),
                Description = dto.Description.Trim(),
                DateMaintenance = dto.DateMaintenance,
                Cout = dto.Cout,
                IdVehicule = dto.IdVehicule,
                Statut = "Planifiée"
            };

            var maintenanceCreee = await _maintenanceRepository
                .AddAsync(maintenance);
            await _statutVehiculeService.ActualiserStatutAsync(
    maintenanceCreee.IdVehicule);

            var maintenanceComplete = await _maintenanceRepository
                .GetByIdAsync(maintenanceCreee.IdMaintenance);

            return VersDto(maintenanceComplete!);
        }

        public async Task<bool> UpdateAsync(UpdateMaintenanceDto dto)
        {
            var maintenance = await _maintenanceRepository
                .GetByIdAsync(dto.IdMaintenance);

            if (maintenance is null)
            {
                return false;
            }

            await VerifierDonneesAsync(
                dto.TypeIntervention,
                dto.Description,
                dto.Cout,
                dto.IdVehicule);

            var statut = dto.Statut.Trim();

            if (!StatutsValides.Contains(statut))
            {
                throw new InvalidOperationException(
                    "Le statut de maintenance est invalide."
                );
            }

            maintenance.TypeIntervention = dto.TypeIntervention.Trim();
            maintenance.Description = dto.Description.Trim();
            maintenance.DateMaintenance = dto.DateMaintenance;
            maintenance.Cout = dto.Cout;
            maintenance.Statut = statut;
            maintenance.IdVehicule = dto.IdVehicule;

            var modifie = await _maintenanceRepository.UpdateAsync(maintenance);

            if (modifie)
            {
                await _statutVehiculeService.ActualiserStatutAsync(
                    maintenance.IdVehicule);
            }

            return modifie;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var maintenance = await _maintenanceRepository.GetByIdAsync(id);

            if (maintenance is null)
            {
                return false;
            }

            var idVehicule = maintenance.IdVehicule;

            var supprime = await _maintenanceRepository.DeleteAsync(id);

            if (supprime)
            {
                await _statutVehiculeService.ActualiserStatutAsync(idVehicule);
            }

            return supprime;
        }

        private async Task VerifierDonneesAsync(
            string typeIntervention,
            string description,
            decimal cout,
            int idVehicule)
        {
            if (string.IsNullOrWhiteSpace(typeIntervention))
            {
                throw new InvalidOperationException(
                    "Le type d’intervention est obligatoire."
                );
            }

            if (string.IsNullOrWhiteSpace(description))
            {
                throw new InvalidOperationException(
                    "La description est obligatoire."
                );
            }

            if (cout < 0)
            {
                throw new InvalidOperationException(
                    "Le coût ne peut pas être négatif."
                );
            }

            if (!await _maintenanceRepository.VehiculeExisteAsync(idVehicule))
            {
                throw new InvalidOperationException(
                    "Véhicule introuvable."
                );
            }
        }

        private static MaintenanceDto VersDto(Maintenance maintenance)
        {
            var vehicule = maintenance.Vehicule is null
                ? "Véhicule inconnu"
                : $"{maintenance.Vehicule.Immatriculation} - " +
                  $"{maintenance.Vehicule.Marque} " +
                  $"{maintenance.Vehicule.Modele}";

            return new MaintenanceDto
            {
                IdMaintenance = maintenance.IdMaintenance,
                TypeIntervention = maintenance.TypeIntervention,
                Description = maintenance.Description,
                DateMaintenance = maintenance.DateMaintenance,
                Cout = maintenance.Cout,
                Statut = maintenance.Statut,
                IdVehicule = maintenance.IdVehicule,
                Vehicule = vehicule
            };
        }
    }
}