export function datesReservationValides(dateDebut, dateFin) {
    if (!dateDebut || !dateFin) {
        return false;
    }

    return new Date(dateFin) > new Date(dateDebut);
}

export function coutMaintenanceValide(cout) {
    const coutNombre = Number(cout);

    return Number.isFinite(coutNombre) && coutNombre >= 0;
}

export function formulaireIncidentValide(incident) {
    if (!incident) {
        return false;
    }

    const gravitesValides = ["Faible", "Moyenne", "Élevée"];

    return (
        String(incident.typeIncident || "").trim() !== "" &&
        String(incident.description || "").trim() !== "" &&
        String(incident.dateIncident || "").trim() !== "" &&
        Number(incident.idVehicule) > 0 &&
        gravitesValides.includes(incident.gravite)
    );
}
