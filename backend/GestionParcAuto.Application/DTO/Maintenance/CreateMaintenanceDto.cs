namespace GestionParcAuto.Application.DTO.Maintenance
{
    public class CreateMaintenanceDto
    {
        public string TypeIntervention { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DateMaintenance { get; set; }
        public decimal Cout { get; set; }
        public int IdVehicule { get; set; }
    }
}