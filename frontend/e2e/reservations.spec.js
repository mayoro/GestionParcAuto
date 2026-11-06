import { expect, test } from "@playwright/test";

async function seConnecterCommeAdministrateur(page) {
    await page.goto("/");

    await page.getByLabel("Email").fill("mayoro2017@gmail.com");

    await page
        .getByLabel("Mot de passe")
        .fill("mayoro");

    await page
        .getByRole("button", {
            name: "Se connecter"
        })
        .click();

    await expect(page).toHaveURL(/\/dashboard$/, {
        timeout: 10_000
    });
}

test("TF-03 : un administrateur crée une réservation depuis l’interface", async ({
    page
}) => {
    await seConnecterCommeAdministrateur(page);

    await page.goto("/reservations");

    await expect(
        page.getByRole("heading", {
            name: "Réservations"
        })
    ).toBeVisible();

    await page
        .getByRole("button", {
            name: "+ Nouvelle réservation"
        })
        .click();

    await expect(
        page.getByRole("heading", {
            name: "Nouvelle réservation"
        })
    ).toBeVisible();

    const employe = page.getByLabel("Employé");
    const vehicule = page.getByLabel("Véhicule");

    await expect(employe.locator("option")).not.toHaveCount(1);
    await expect(vehicule.locator("option")).not.toHaveCount(1);

    await employe.selectOption({
        index: 1
    });

    await vehicule.selectOption({
        index: 1
    });

    await page
        .getByLabel("Date et heure de début")
        .fill("2026-12-20T09:00");

    await page
        .getByLabel("Date et heure de fin")
        .fill("2026-12-20T17:00");

    const boutonEnregistrer = page.getByRole("button", {
        name: "Enregistrer"
    });

    await expect(boutonEnregistrer).toBeEnabled();

    const reponseCreationPromise = page.waitForResponse(
        (response) =>
            response.url().includes("/api/Reservation") &&
            response.request().method() === "POST",
        {
            timeout: 10_000
        }
    );

    await boutonEnregistrer.click();

    const reponseCreation = await reponseCreationPromise;

    expect(
        reponseCreation.ok(),
        `La création de réservation a échoué : HTTP ${reponseCreation.status()}`
    ).toBeTruthy();

    await expect(
        page.getByText("Réservation créée avec succès.")
    ).toBeVisible({
        timeout: 10_000
    });

    await expect(
        page.getByRole("cell", {
            name: "20/12/2026 09:00",
            exact: true
        }).last()
    ).toBeVisible({
        timeout: 10_000
    });

    await expect(
        page.getByRole("cell", {
            name: "20/12/2026 17:00",
            exact: true
        }).last()
    ).toBeVisible({
        timeout: 10_000
    });
});