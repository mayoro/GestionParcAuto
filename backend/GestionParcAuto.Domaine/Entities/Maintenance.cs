namespace GestionParcAuto.Domaine.Entities
{
    public class Maintenance
    {
        public int IdMaintenance { get; set; }
        public string TypeIntervention { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DateMaintenance { get; set; }
        public decimal Cout { get; set; }
        public string Statut { get; set; } = string.Empty;

        public int IdVehicule { get; set; }
        public Vehicule? Vehicule { get; set; }
    }
}

