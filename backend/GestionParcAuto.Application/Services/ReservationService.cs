using GestionParcAuto.Application.DTO.Reservation;
using GestionParcAuto.Application.Interfaces.Repositories;
using GestionParcAuto.Application.Interfaces.Services;
using GestionParcAuto.Domaine.Entities;

namespace GestionParcAuto.Application.Services
{
    public class ReservationService : IReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly IStatutVehiculeService _statutVehiculeService;

        private static readonly string[] StatutsValides =
        [
            "Confirmée",
            "En cours",
            "Terminée",
            "Annulée"
        ];

        public ReservationService(
    IReservationRepository reservationRepository,
    IStatutVehiculeService statutVehiculeService)
        {
            _reservationRepository = reservationRepository;
            _statutVehiculeService = statutVehiculeService;
        }

        public async Task<IEnumerable<ReservationDto>> GetAllAsync()
        {
            var reservations = await _reservationRepository.GetAllAsync();

            return reservations.Select(VersDto);
        }

        public async Task<ReservationDto?> GetByIdAsync(int id)
        {
            var reservation = await _reservationRepository.GetByIdAsync(id);

            return reservation is null ? null : VersDto(reservation);
        }

        public async Task<ReservationDto> CreateAsync(CreateReservationDto dto)
        {
            await VerifierDonneesAsync(
                dto.DateDebut,
                dto.DateFin,
                dto.IdUtilisateur,
                dto.IdVehicule);

            var reservation = new Reservation
            {
                DateDebut = dto.DateDebut,
                DateFin = dto.DateFin,
                IdUtilisateur = dto.IdUtilisateur,
                IdVehicule = dto.IdVehicule,
                Statut = "Confirmée"
            };

            var reservationCreee = await _reservationRepository.AddAsync(reservation);
            await _statutVehiculeService.ActualiserStatutAsync(
    reservationCreee.IdVehicule);

            var reservationComplete = await _reservationRepository
                .GetByIdAsync(reservationCreee.IdReservation);

            return VersDto(reservationComplete!);
        }

        public async Task<bool> UpdateAsync(UpdateReservationDto dto)
        {
            var reservation = await _reservationRepository.GetByIdAsync(dto.IdReservation);

            if (reservation is null)
            {
                return false;
            }

            var statut = dto.Statut.Trim();

            if (!StatutsValides.Contains(statut))
            {
                throw new InvalidOperationException(
                    "Le statut de réservation est invalide."
                );
            }

            if (dto.DateFin <= dto.DateDebut)
            {
                throw new InvalidOperationException(
                    "La date de fin doit être après la date de début."
                );
            }

            if (!await _reservationRepository.UtilisateurExisteAsync(dto.IdUtilisateur))
            {
                throw new InvalidOperationException(
                    "Utilisateur introuvable."
                );
            }

            if (!await _reservationRepository.VehiculeExisteAsync(dto.IdVehicule))
            {
                throw new InvalidOperationException(
                    "Véhicule introuvable."
                );
            }

            var reservationActive =
                statut == "Confirmée" || statut == "En cours";

            if (reservationActive)
            {
                var conflit = await _reservationRepository.PossedeConflitAsync(
                    dto.IdVehicule,
                    dto.DateDebut,
                    dto.DateFin,
                    dto.IdReservation);

                if (conflit)
                {
                    throw new InvalidOperationException(
                        "Ce véhicule est déjà réservé pendant cette période."
                    );
                }
            }

            reservation.DateDebut = dto.DateDebut;
            reservation.DateFin = dto.DateFin;
            reservation.Statut = statut;
            reservation.IdUtilisateur = dto.IdUtilisateur;
            reservation.IdVehicule = dto.IdVehicule;

            var modifie = await _reservationRepository.UpdateAsync(reservation);

            if (modifie)
            {
                await _statutVehiculeService.ActualiserStatutAsync(
                    reservation.IdVehicule);
            }

            return modifie;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var reservation = await _reservationRepository.GetByIdAsync(id);

            if (reservation is null)
            {
                return false;
            }

            var idVehicule = reservation.IdVehicule;

            var supprime = await _reservationRepository.DeleteAsync(id);

            if (supprime)
            {
                await _statutVehiculeService.ActualiserStatutAsync(idVehicule);
            }

            return supprime;
        }

        private async Task VerifierDonneesAsync(
            DateTime dateDebut,
            DateTime dateFin,
            int idUtilisateur,
            int idVehicule)
        {
            if (dateFin <= dateDebut)
            {
                throw new InvalidOperationException(
                    "La date de fin doit être après la date de début."
                );
            }

            if (!await _reservationRepository.UtilisateurExisteAsync(idUtilisateur))
            {
                throw new InvalidOperationException(
                    "Utilisateur introuvable."
                );
            }

            if (!await _reservationRepository.VehiculeExisteAsync(idVehicule))
            {
                throw new InvalidOperationException(
                    "Véhicule introuvable."
                );
            }

            var conflit = await _reservationRepository.PossedeConflitAsync(
                idVehicule,
                dateDebut,
                dateFin);

            if (conflit)
            {
                throw new InvalidOperationException(
                    "Ce véhicule est déjà réservé pendant cette période."
                );
            }
        }

        private static ReservationDto VersDto(Reservation reservation)
        {
            var vehicule = reservation.Vehicule is null
                ? "Véhicule inconnu"
                : $"{reservation.Vehicule.Immatriculation} - " +
                  $"{reservation.Vehicule.Marque} {reservation.Vehicule.Modele}";

            return new ReservationDto
            {
                IdReservation = reservation.IdReservation,
                DateDebut = reservation.DateDebut,
                DateFin = reservation.DateFin,
                Statut = reservation.Statut,
                IdUtilisateur = reservation.IdUtilisateur,
                Employe = reservation.Utilisateur?.NomComplet ?? "Utilisateur inconnu",
                IdVehicule = reservation.IdVehicule,
                Vehicule = vehicule
            };
        }
    }
}