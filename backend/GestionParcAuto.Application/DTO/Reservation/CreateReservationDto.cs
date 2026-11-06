namespace GestionParcAuto.Application.DTO.Reservation
{
    public class CreateReservationDto
    {
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }

        public int IdUtilisateur { get; set; }
        public int IdVehicule { get; set; }
    }
}