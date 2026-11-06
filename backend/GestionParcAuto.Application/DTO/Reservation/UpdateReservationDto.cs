namespace GestionParcAuto.Application.DTO.Reservation
{
    public class UpdateReservationDto
    {
        public int IdReservation { get; set; }

        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public string Statut { get; set; } = string.Empty;

        public int IdUtilisateur { get; set; }
        public int IdVehicule { get; set; }
    }
}