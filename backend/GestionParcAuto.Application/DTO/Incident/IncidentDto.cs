namespace GestionParcAuto.Application.DTO.Incident
{
    public class IncidentDto
    {
        public int Id { get; set; }
        public string TypeIncident { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Gravite { get; set; } = string.Empty;
        public DateTime DateIncident { get; set; }
        public string Statut { get; set; } = string.Empty;

        public int IdVehicule { get; set; }
        public string Vehicule { get; set; } = string.Empty;
    }
}