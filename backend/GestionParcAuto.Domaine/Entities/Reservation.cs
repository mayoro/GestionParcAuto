namespace GestionParcAuto.Domaine.Entities
{
    public class Reservation
    {
        public int IdReservation { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public string Statut { get; set; } = string.Empty;

        public int IdUtilisateur { get; set; }
        public Utilisateur? Utilisateur { get; set; }

        public int IdVehicule { get; set; }
        public Vehicule? Vehicule { get; set; }
    }
}

