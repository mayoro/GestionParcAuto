import { expect, test } from "@playwright/test";

test("TF-01 : connexion réussie et accès au tableau de bord", async ({
    page
}) => {
    await page.goto("/");

    await expect(
        page.getByRole("heading", {
            name: "Connexion"
        })
    ).toBeVisible();

    await page.getByLabel("Email").fill("mayoro2017@gmail.com");

    await page
        .getByLabel("Mot de passe")
        .fill("mayoro");

    await page
        .getByRole("button", {
            name: "Se connecter"
        })
        .click();

    await expect(page).toHaveURL(/\/dashboard$/);
});