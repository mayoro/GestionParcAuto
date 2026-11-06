namespace GestionParcAuto.Application.DTO.Reservation
{
    public class ReservationDto
    {
        public int IdReservation { get; set; }

        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public string Statut { get; set; } = string.Empty;

        public int IdUtilisateur { get; set; }
        public string Employe { get; set; } = string.Empty;

        public int IdVehicule { get; set; }
        public string Vehicule { get; set; } = string.Empty;
    }
}