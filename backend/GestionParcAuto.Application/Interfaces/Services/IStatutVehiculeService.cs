namespace GestionParcAuto.Application.Interfaces.Services
{
    public interface IStatutVehiculeService
    {
        Task ActualiserStatutAsync(int idVehicule);
    }
}
