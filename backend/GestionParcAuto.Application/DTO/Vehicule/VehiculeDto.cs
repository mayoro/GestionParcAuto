namespace GestionParcAuto.Application.DTO.Vehicule
{
    public class VehiculeDto
    {
        public int IdVehicule { get; set; }
        public string Immatriculation { get; set; } = string.Empty;
        public string Marque { get; set; } = string.Empty;
        public string Modele { get; set; } = string.Empty;
        public int Annee { get; set; }
        public int Kilometrage { get; set; }
        public string Statut { get; set; } = string.Empty;
    }
}