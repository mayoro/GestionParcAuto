# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authentification.spec.js >> TF-01 : connexion réussie et accès au tableau de bord
- Location: e2e\authentification.spec.js:3:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard$/
Received string:  "http://localhost:5173/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × locator resolved to <html lang="fr">…</html>
       - unexpected value "http://localhost:5173/"

```

```yaml
- heading "GestionParcAuto" [level=1]
- paragraph: Gérez votre parc automobile en toute simplicité
- heading "Connexion" [level=2]
- paragraph: Connectez-vous à votre compte
- text: Email
- textbox "Email": mayoro2017@gmail.com
- text: Mot de passe
- textbox "Mot de passe": mayoro
- button "Connexion..." [disabled]
```

# Test source

```ts
  1  | ﻿import { expect, test } from "@playwright/test";
  2  | 
  3  | test("TF-01 : connexion réussie et accès au tableau de bord", async ({
  4  |     page
  5  | }) => {
  6  |     await page.goto("/");
  7  | 
  8  |     await expect(
  9  |         page.getByRole("heading", {
  10 |             name: "Connexion"
  11 |         })
  12 |     ).toBeVisible();
  13 | 
  14 |     await page.getByLabel("Email").fill("mayoro2017@gmail.com");
  15 | 
  16 |     await page
  17 |         .getByLabel("Mot de passe")
  18 |         .fill("mayoro");
  19 | 
  20 |     await page
  21 |         .getByRole("button", {
  22 |             name: "Se connecter"
  23 |         })
  24 |         .click();
  25 | 
> 26 |     await expect(page).toHaveURL(/\/dashboard$/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  27 | });
```