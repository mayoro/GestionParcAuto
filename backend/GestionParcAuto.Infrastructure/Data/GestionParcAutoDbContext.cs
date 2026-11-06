using GestionParcAuto.Domaine.Entities;
using Microsoft.EntityFrameworkCore;

namespace GestionParcAuto.Infrastructure.Data
{
    public class GestionParcAutoDbContext : DbContext
    {
        public GestionParcAutoDbContext(
            DbContextOptions<GestionParcAutoDbContext> options)
            : base(options)
        {
        }

        // =========================
        // DbSet
        // =========================

        public DbSet<Utilisateur> Utilisateurs { get; set; }
        public DbSet<Vehicule> Vehicules { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Maintenance> Maintenances { get; set; }
        public DbSet<Incident> Incidents { get; set; }

        // =========================
        // Configuration
        // =========================

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // -------------------------
            // Utilisateur
            // -------------------------
            modelBuilder.Entity<Utilisateur>(entity =>
            {
                entity.HasKey(e => e.IdUtilisateur);

                entity.Property(e => e.NomComplet)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(150);

                entity.Property(e => e.MotDePasseHash)
                    .IsRequired();

                entity.Property(e => e.Role)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasIndex(e => e.Email)
                    .IsUnique();
            });

            // -------------------------
            // Véhicule
            // -------------------------
            modelBuilder.Entity<Vehicule>(entity =>
            {
                entity.HasKey(e => e.IdVehicule);

                entity.Property(e => e.Immatriculation)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Marque)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Modele)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Statut)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasIndex(e => e.Immatriculation)
                    .IsUnique();
            });

            // -------------------------
            // Réservation
            // -------------------------
            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.HasKey(e => e.IdReservation);

                entity.Property(e => e.Statut)
                    .IsRequired()
                    .HasMaxLength(50);

                // Utilisateur -> Réservations
                entity.HasOne(e => e.Utilisateur)
                    .WithMany()
                    .HasForeignKey(e => e.IdUtilisateur)
                    .OnDelete(DeleteBehavior.Restrict);

                // Véhicule -> Réservations
                entity.HasOne(e => e.Vehicule)
                    .WithMany(v => v.Reservations)
                    .HasForeignKey(e => e.IdVehicule)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // -------------------------
            // Maintenance
            // -------------------------
            modelBuilder.Entity<Maintenance>(entity =>
            {
                entity.HasKey(e => e.IdMaintenance);

                entity.Property(e => e.TypeIntervention)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Description)
                    .HasMaxLength(500);

                entity.Property(e => e.Cout)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Statut)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasOne(e => e.Vehicule)
                    .WithMany(v => v.Maintenances)
                    .HasForeignKey(e => e.IdVehicule)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // -------------------------
            // Incident
            // -------------------------
            modelBuilder.Entity<Incident>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.TypeIncident)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Description)
                    .HasMaxLength(500);

                entity.Property(e => e.Gravite)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Statut)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasOne(e => e.Vehicule)
                    .WithMany(v => v.Incidents)
                    .HasForeignKey(e => e.IdVehicule)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}