using GestionParcAuto.Application.Interfaces.Repositories;
using GestionParcAuto.Application.Interfaces.Services;

namespace GestionParcAuto.Application.Services
{
    public class StatutVehiculeService : IStatutVehiculeService
    {
        private readonly IVehiculeRepository _vehiculeRepository;
        private readonly IReservationRepository _reservationRepository;
        private readonly IMaintenanceRepository _maintenanceRepository;

        public StatutVehiculeService(
            IVehiculeRepository vehiculeRepository,
            IReservationRepository reservationRepository,
            IMaintenanceRepository maintenanceRepository)
        {
            _vehiculeRepository = vehiculeRepository;
            _reservationRepository = reservationRepository;
            _maintenanceRepository = maintenanceRepository;
        }

        public async Task ActualiserStatutAsync(int idVehicule)
        {
            var vehicule = await _vehiculeRepository.GetByIdAsync(idVehicule);

            if (vehicule is null)
            {
                return;
            }

            var maintenanceEnCours = await _maintenanceRepository
                .PossedeMaintenanceEnCoursAsync(idVehicule);

            if (maintenanceEnCours)
            {
                vehicule.Statut = "En maintenance";
                await _vehiculeRepository.UpdateAsync(vehicule);
                return;
            }

            var reservationActive = await _reservationRepository
                .PossedeReservationActiveAsync(idVehicule);

            vehicule.Statut = reservationActive
                ? "Réservé"
                : "Disponible";

            await _vehiculeRepository.UpdateAsync(vehicule);
        }
    }
}