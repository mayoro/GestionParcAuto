using GestionParcAuto.Application.DTO.Vehicule;
using GestionParcAuto.Application.Interfaces.Repositories;
using GestionParcAuto.Application.Interfaces.Services;
using GestionParcAuto.Domaine.Entities;

namespace GestionParcAuto.Application.Services
{
    public class VehiculeService : IVehiculeService
    {
        private readonly IVehiculeRepository _vehiculeRepository;

        public VehiculeService(IVehiculeRepository vehiculeRepository)
        {
            _vehiculeRepository = vehiculeRepository;
        }

        public async Task<IEnumerable<VehiculeDto>> GetAllAsync()
        {
            var vehicules = await _vehiculeRepository.GetAllAsync();

            return vehicules.Select(VersDto);
        }

        public async Task<VehiculeDto?> GetByIdAsync(int id)
        {
            var vehicule = await _vehiculeRepository.GetByIdAsync(id);

            return vehicule is null ? null : VersDto(vehicule);
        }

        public async Task<VehiculeDto> CreateAsync(CreateVehiculeDto dto)
        {
            var immatriculation = dto.Immatriculation.Trim().ToUpper();

            var vehiculeExistant = await _vehiculeRepository
                .GetByImmatriculationAsync(immatriculation);

            if (vehiculeExistant is not null)
            {
                throw new InvalidOperationException(
                    "Un véhicule possède déjà cette immatriculation."
                );
            }

            var vehicule = new Vehicule
            {
                Immatriculation = immatriculation,
                Marque = dto.Marque.Trim(),
                Modele = dto.Modele.Trim(),
                Annee = dto.Annee,
                Kilometrage = dto.Kilometrage,
                Statut = dto.Statut.Trim()
            };

            var vehiculeCree = await _vehiculeRepository.AddAsync(vehicule);

            return VersDto(vehiculeCree);
        }

        public async Task<bool> UpdateAsync(UpdateVehiculeDto dto)
        {
            var vehicule = await _vehiculeRepository.GetByIdAsync(dto.IdVehicule);

            if (vehicule is null)
            {
                return false;
            }

            var immatriculation = dto.Immatriculation.Trim().ToUpper();

            var vehiculeAvecMemeImmatriculation = await _vehiculeRepository
                .GetByImmatriculationAsync(immatriculation);

            if (vehiculeAvecMemeImmatriculation is not null &&
                vehiculeAvecMemeImmatriculation.IdVehicule != dto.IdVehicule)
            {
                throw new InvalidOperationException(
                    "Un véhicule possède déjà cette immatriculation."
                );
            }

            vehicule.Immatriculation = immatriculation;
            vehicule.Marque = dto.Marque.Trim();
            vehicule.Modele = dto.Modele.Trim();
            vehicule.Annee = dto.Annee;
            vehicule.Kilometrage = dto.Kilometrage;
            vehicule.Statut = dto.Statut.Trim();

            return await _vehiculeRepository.UpdateAsync(vehicule);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _vehiculeRepository.DeleteAsync(id);
        }

        private static VehiculeDto VersDto(Vehicule vehicule)
        {
            return new VehiculeDto
            {
                IdVehicule = vehicule.IdVehicule,
                Immatriculation = vehicule.Immatriculation,
                Marque = vehicule.Marque,
                Modele = vehicule.Modele,
                Annee = vehicule.Annee,
                Kilometrage = vehicule.Kilometrage,
                Statut = vehicule.Statut
            };
        }
    }
}