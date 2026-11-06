namespace GestionParcAuto.Application.DTO.Incident
{
    public class CreateIncidentDto
    {
        public string TypeIncident { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Gravite { get; set; } = string.Empty;
        public DateTime DateIncident { get; set; }
        public int IdVehicule { get; set; }
    }
}