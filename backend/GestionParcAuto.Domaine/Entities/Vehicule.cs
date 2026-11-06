namespace GestionParcAuto.Domaine.Entities
{
    public class Vehicule
    {
        public int IdVehicule { get; set; }
        public string Immatriculation { get; set; } = string.Empty;
        public string Marque { get; set; } = string.Empty;
        public string Modele { get; set; } = string.Empty;
        public int Annee { get; set; }
        public int Kilometrage { get; set; }
        public string Statut { get; set; } = string.Empty;

        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public ICollection<Maintenance> Maintenances { get; set; } = new List<Maintenance>();
        public ICollection<Incident> Incidents { get; set; } = new List<Incident>();
    }
}

