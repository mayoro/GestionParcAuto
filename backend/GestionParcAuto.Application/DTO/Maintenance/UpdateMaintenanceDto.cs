namespace GestionParcAuto.Application.DTO.Maintenance
{
    public class UpdateMaintenanceDto
    {
        public int IdMaintenance { get; set; }
        public string TypeIntervention { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DateMaintenance { get; set; }
        public decimal Cout { get; set; }
        public string Statut { get; set; } = string.Empty;
        public int IdVehicule { get; set; }
    }
}