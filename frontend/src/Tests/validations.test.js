import { describe, expect, it } from "vitest";

import {
    coutMaintenanceValide,
    datesReservationValides,
    formulaireIncidentValide
} from "../utils/validations";

describe("Tests unitaires des validations", () => {
    it("accepte une réservation dont la date de fin est après la date de début", () => {
        const resultat = datesReservationValides(
            "2026-08-20T08:00",
            "2026-08-22T18:00"
        );

        expect(resultat).toBe(true);
    });

    it("refuse une maintenance avec un coût négatif", () => {
        const resultat = coutMaintenanceValide(-15);

        expect(resultat).toBe(false);
    });

    it("accepte un incident complet avec une gravité valide", () => {
        const incident = {
            typeIncident: "Pneu crevé",
            description: "Pneu avant gauche endommagé.",
            gravite: "Moyenne",
            dateIncident: "2026-08-20T10:00",
            idVehicule: 2
        };

        expect(formulaireIncidentValide(incident)).toBe(true);
    });
});