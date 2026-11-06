import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import MaintenancePage from "../pages/MaintenancePage";

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

function creerReponseJson(donnees) {
    return {
        ok: true,
        status: 200,
        json: async () => donnees
    };
}

describe("Tests d’intégration - Maintenance", () => {
    beforeEach(() => {
        localStorage.setItem("token", "token-de-test");

        global.fetch = vi.fn((url) => {
            if (url.includes("/Maintenance")) {
                return Promise.resolve(creerReponseJson([]));
            }

            if (url.includes("/Vehicule")) {
                return Promise.resolve(creerReponseJson(vehicules));
            }

            return Promise.resolve(creerReponseJson([]));
        });
    });

    afterEach(() => {
        cleanup();
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it("TI-02 ouvre le formulaire et présélectionne le véhicule venant de l’URL", async () => {
        render(
            <MemoryRouter initialEntries={["/maintenance?vehicule=2"]}>
                <MaintenancePage />
            </MemoryRouter>
        );

        expect(
            await screen.findByRole("heading", {
                name: "Planifier une maintenance"
            })
        ).toBeInTheDocument();

        const selectVehicule = screen.getByLabelText("Véhicule");

        expect(selectVehicule).toHaveValue("2");

        expect(
            screen.getByText("APA 67C - Buick Verano")
        ).toBeInTheDocument();
    });

    it("TI-03 charge et affiche une maintenance provenant de l’API", async () => {
        const maintenance = {
            idMaintenance: 15,
            vehicule: "APA 67C - Buick Verano",
            typeIntervention: "Vidange",
            description: "Vidange moteur avec remplacement du filtre.",
            dateMaintenance: "2026-09-15T09:30:00",
            cout: 150,
            statut: "Planifiée",
            idVehicule: 2
        };

        global.fetch = vi.fn((url) => {
            if (url.includes("/Maintenance")) {
                return Promise.resolve(
                    creerReponseJson([maintenance])
                );
            }

            if (url.includes("/Vehicule")) {
                return Promise.resolve(
                    creerReponseJson(vehicules)
                );
            }

            return Promise.resolve(creerReponseJson([]));
        });

        render(
            <MemoryRouter initialEntries={["/maintenance"]}>
                <MaintenancePage />
            </MemoryRouter>
        );

        expect(await screen.findByText("Vidange")).toBeInTheDocument();

        expect(
            screen.getByText("APA 67C - Buick Verano")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Planifiée", {
                selector: "span.maintenance-status"
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText(/15\/09\/2026/)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/150,00\s?€/)
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "1 maintenance(s) chargée(s) depuis l’API."
            )
        ).toBeInTheDocument();

        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5236/api/Maintenance",
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: "Bearer token-de-test"
                })
            })
        );

        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:5236/api/Vehicule",
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: "Bearer token-de-test"
                })
            })
        );
    });
});