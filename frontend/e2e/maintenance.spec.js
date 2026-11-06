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

test("TF-02 : un administrateur planifie une maintenance depuis l’interface", async ({
    page
}) => {
    const typeIntervention = "E2E Playwright Vidange";
    const description =
        "Maintenance créée automatiquement par le test fonctionnel Playwright.";

    await seConnecterCommeAdministrateur(page);

    await page.goto("/maintenance");

    await expect(
        page.getByRole("heading", {
            name: "Maintenance"
        })
    ).toBeVisible();

    await page
        .getByRole("button", {
            name: "+ Planifier maintenance"
        })
        .click();

    await expect(
        page.getByRole("heading", {
            name: "Planifier une maintenance"
        })
    ).toBeVisible();

    const vehicule = page.getByLabel("Véhicule");

    await expect(vehicule.locator("option")).not.toHaveCount(1);

    await vehicule.selectOption({
        index: 1
    });

    await page
        .getByLabel("Type d’intervention")
        .fill(typeIntervention);

    await page
        .getByLabel("Date et heure prévues")
        .fill("2026-12-15T09:30");

    await page.getByLabel("Coût").fill("150");

    await page.getByLabel("Description").fill(description);

    const boutonEnregistrer = page.getByRole("button", {
        name: "Enregistrer"
    });

    await expect(boutonEnregistrer).toBeEnabled();

    const reponseCreationPromise = page.waitForResponse(
        (response) =>
            response.url() === "http://localhost:5236/api/Maintenance" &&
            response.request().method() === "POST" &&
            response.ok()
    );

    await boutonEnregistrer.click();

    await reponseCreationPromise;

    await expect(
        page.getByText("Maintenance planifiée avec succès.")
    ).toBeVisible();

    await expect(
        page.getByRole("cell", {
            name: typeIntervention,
            exact: true
        }).last()
    ).toBeVisible({
        timeout: 10_000
    });
});
