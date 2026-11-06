using System.ComponentModel.DataAnnotations;

namespace GestionParcAuto.Application.DTO.Vehicule
{
    public class CreateVehiculeDto
    {
        [Required]
        [StringLength(50)]
        public string Immatriculation { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Marque { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Modele { get; set; } = string.Empty;

        [Range(1900, 2100)]
        public int Annee { get; set; }

        [Range(0, int.MaxValue)]
        public int Kilometrage { get; set; }

        [Required]
        public string Statut { get; set; } = "Disponible";
    }
}