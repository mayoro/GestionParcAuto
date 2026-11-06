import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import ReservationsPage from "../pages/ReservationsPage";

const afficherNotification = vi.fn();

vi.mock("../context/NotificationContext", () => ({
    useNotification: () => ({
        afficherNotification
    })
}));

const vehicules = [
    {
        idVehicule: 2,
        immatriculation: "APA 67C",
        marque: "Buick",
        modele: "Verano"
    }
];

const utilisateurs = [
    {
        idUtilisateur: 1,
        nomComplet: "Mayoro Mbathie"
    }
];

function creerReponseJson(donnees) {
    return {
        ok: true,
        status: 200,
        json: async () => donnees
    };
}

describe("Tests d’intégration - Réservations", () => {
    beforeEach(() => {
        localStorage.setItem("token", "token-de-test");

        global.fetch = vi.fn((url) => {
            if (url.includes("/Reservation")) {
                return Promise.resolve(creerReponseJson([]));
            }

            if (url.includes("/Vehicule")) {
                return Promise.resolve(creerReponseJson(vehicules));
            }

            if (url.includes("/Utilisateur")) {
                return Promise.resolve(creerReponseJson(utilisateurs));
            }

            return Promise.resolve(creerReponseJson([]));
        });
    });

    afterEach(() => {
        cleanup();
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it("TI-01 charge les listes et active Enregistrer quand le formulaire est valide", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/reservations?vehicule=2"]}>
                <ReservationsPage />
            </MemoryRouter>
        );

        const boutonEnregistrer = await screen.findByRole("button", {
            name: "Enregistrer"
        });

        const selectEmploye = screen.getByLabelText("Employé");
        const selectVehicule = screen.getByLabelText("Véhicule");
        const dateDebut = screen.getByLabelText("Date et heure de début");
        const dateFin = screen.getByLabelText("Date et heure de fin");

        expect(screen.getByText("APA 67C - Buick Verano")).toBeInTheDocument();
        expect(selectVehicule).toHaveValue("2");
        expect(boutonEnregistrer).toBeDisabled();

        await user.selectOptions(selectEmploye, "1");
        await user.clear(dateDebut);
        await user.type(dateDebut, "2026-09-08T08:00");

        await user.clear(dateFin);
        await user.type(dateFin, "2026-09-10T18:00");

        await waitFor(() => {
            expect(boutonEnregistrer).toBeEnabled();
        });
    });
});