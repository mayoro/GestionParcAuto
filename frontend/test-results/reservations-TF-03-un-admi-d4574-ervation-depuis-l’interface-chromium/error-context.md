# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reservations.spec.js >> TF-03 : un administrateur crée une réservation depuis l’interface
- Location: e2e\reservations.spec.js:23:1

# Error details

```
Error: La création de réservation a échoué : HTTP 409

expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - complementary [ref=f1e4]:
    - generic [ref=f1e5]:
      - generic [ref=f1e6]:
        - generic [ref=f1e7]: G
        - generic [ref=f1e8]:
          - heading "GestionParcAuto" [level=3] [ref=f1e9]
          - paragraph [ref=f1e10]: Administration
      - navigation [ref=f1e11]:
        - link "Dashboard" [ref=f1e12] [cursor=pointer]:
          - /url: /dashboard
        - link "Véhicules" [ref=f1e13] [cursor=pointer]:
          - /url: /vehicules
        - link "Réservations" [ref=f1e14] [cursor=pointer]:
          - /url: /reservations
        - link "Maintenance" [ref=f1e15] [cursor=pointer]:
          - /url: /maintenance
        - link "Incidents" [ref=f1e16] [cursor=pointer]:
          - /url: /incidents
        - link "Utilisateurs" [ref=f1e17] [cursor=pointer]:
          - /url: /utilisateurs
    - button "Déconnexion" [ref=f1e18] [cursor=pointer]
  - generic [ref=f1e19]:
    - banner [ref=f1e20]:
      - button "☰" [ref=f1e21] [cursor=pointer]
      - generic [ref=f1e22]:
        - button "🔔" [ref=f1e23] [cursor=pointer]
        - generic [ref=f1e24]:
          - generic [ref=f1e25]: M
          - generic [ref=f1e26]:
            - strong [ref=f1e27]: Mbathie Mayoro
            - generic [ref=f1e28]: Administrateur
    - main [ref=f1e29]:
      - generic [ref=f1e30]:
        - generic [ref=f1e31]:
          - heading "Réservations" [level=1] [ref=f1e32]
          - button "+ Nouvelle réservation" [ref=f1e33]
        - generic [ref=f1e34]:
          - textbox "Rechercher un véhicule ou un employé..." [ref=f1e36]
          - generic [ref=f1e37]:
            - combobox [ref=f1e38]:
              - option "Tous les statuts" [selected]
              - option "Confirmée"
              - option "En cours"
              - option "Terminée"
              - option "Annulée"
            - combobox [ref=f1e39]:
              - option "Toutes les périodes" [selected]
              - option "Cette semaine"
              - option "Ce mois"
              - option "Cette année"
        - generic [ref=f1e40]:
          - generic [ref=f1e41]:
            - heading "Nouvelle réservation" [level=2] [ref=f1e42]
            - button "×" [ref=f1e43] [cursor=pointer]
          - generic [ref=f1e44]:
            - generic [ref=f1e45]:
              - generic [ref=f1e46]:
                - generic [ref=f1e47]: Employé
                - combobox "Employé" [ref=f1e48]:
                  - option "Sélectionner un employé"
                  - option "Mayoro Mbathie" [selected]
                  - option "mayoro"
                  - option "Amadou"
                  - option "aly"
              - generic [ref=f1e49]:
                - generic [ref=f1e50]: Véhicule
                - combobox "Véhicule" [ref=f1e51]:
                  - option "Sélectionner un véhicule"
                  - option "AB-123-CD - Toyota Corolla" [selected]
                  - option "ADE945 - Chevrolet Cruze"
                  - option "APA 67C - Buick Verano"
                  - option "CEC 35D - Mitsubishi RVR"
              - generic [ref=f1e52]:
                - generic [ref=f1e53]: Date et heure de début
                - textbox "Date et heure de début" [ref=f1e54]: 2026-12-20T09:00
              - generic [ref=f1e55]:
                - generic [ref=f1e56]: Date et heure de fin
                - textbox "Date et heure de fin" [ref=f1e57]: 2026-12-20T17:00
            - paragraph [ref=f1e58]: Ce véhicule est déjà réservé pendant cette période.
            - generic [ref=f1e59]:
              - button "Enregistrer" [ref=f1e60]
              - button "Annuler" [ref=f1e61] [cursor=pointer]
        - generic [ref=f1e62]:
          - table [ref=f1e64]:
            - rowgroup [ref=f1e65]:
              - row [ref=f1e66]:
                - columnheader "Véhicule" [ref=f1e67]
                - columnheader "Employé" [ref=f1e68]
                - columnheader "Date début" [ref=f1e69]
                - columnheader "Date fin" [ref=f1e70]
                - columnheader "Statut" [ref=f1e71]
                - columnheader "Actions" [ref=f1e72]
            - rowgroup [ref=f1e73]:
              - row [ref=f1e74]:
                - cell "AB-123-CD - Toyota Corolla" [ref=f1e75]
                - cell "Mayoro Mbathie" [ref=f1e76]
                - cell "20/12/2026 09:00" [ref=f1e77]
                - cell "20/12/2026 17:00" [ref=f1e78]
                - cell "Confirmée" [ref=f1e79]
                - cell [ref=f1e81]:
                  - generic [ref=f1e82]:
                    - button "✏️" [ref=f1e83]
                    - button "🗑️" [ref=f1e84]
          - paragraph [ref=f1e86]: 1 réservation(s) chargée(s) depuis l’API.
```

# Test source

```ts
  1   | ﻿import { expect, test } from "@playwright/test";
  2   | 
  3   | async function seConnecterCommeAdministrateur(page) {
  4   |     await page.goto("/");
  5   | 
  6   |     await page.getByLabel("Email").fill("mayoro2017@gmail.com");
  7   | 
  8   |     await page
  9   |         .getByLabel("Mot de passe")
  10  |         .fill("mayoro");
  11  | 
  12  |     await page
  13  |         .getByRole("button", {
  14  |             name: "Se connecter"
  15  |         })
  16  |         .click();
  17  | 
  18  |     await expect(page).toHaveURL(/\/dashboard$/, {
  19  |         timeout: 10_000
  20  |     });
  21  | }
  22  | 
  23  | test("TF-03 : un administrateur crée une réservation depuis l’interface", async ({
  24  |     page
  25  | }) => {
  26  |     await seConnecterCommeAdministrateur(page);
  27  | 
  28  |     await page.goto("/reservations");
  29  | 
  30  |     await expect(
  31  |         page.getByRole("heading", {
  32  |             name: "Réservations"
  33  |         })
  34  |     ).toBeVisible();
  35  | 
  36  |     await page
  37  |         .getByRole("button", {
  38  |             name: "+ Nouvelle réservation"
  39  |         })
  40  |         .click();
  41  | 
  42  |     await expect(
  43  |         page.getByRole("heading", {
  44  |             name: "Nouvelle réservation"
  45  |         })
  46  |     ).toBeVisible();
  47  | 
  48  |     const employe = page.getByLabel("Employé");
  49  |     const vehicule = page.getByLabel("Véhicule");
  50  | 
  51  |     await expect(employe.locator("option")).not.toHaveCount(1);
  52  |     await expect(vehicule.locator("option")).not.toHaveCount(1);
  53  | 
  54  |     await employe.selectOption({
  55  |         index: 1
  56  |     });
  57  | 
  58  |     await vehicule.selectOption({
  59  |         index: 1
  60  |     });
  61  | 
  62  |     await page
  63  |         .getByLabel("Date et heure de début")
  64  |         .fill("2026-12-20T09:00");
  65  | 
  66  |     await page
  67  |         .getByLabel("Date et heure de fin")
  68  |         .fill("2026-12-20T17:00");
  69  | 
  70  |     const boutonEnregistrer = page.getByRole("button", {
  71  |         name: "Enregistrer"
  72  |     });
  73  | 
  74  |     await expect(boutonEnregistrer).toBeEnabled();
  75  | 
  76  |     const reponseCreationPromise = page.waitForResponse(
  77  |         (response) =>
  78  |             response.url().includes("/api/Reservation") &&
  79  |             response.request().method() === "POST",
  80  |         {
  81  |             timeout: 10_000
  82  |         }
  83  |     );
  84  | 
  85  |     await boutonEnregistrer.click();
  86  | 
  87  |     const reponseCreation = await reponseCreationPromise;
  88  | 
  89  |     expect(
  90  |         reponseCreation.ok(),
  91  |         `La création de réservation a échoué : HTTP ${reponseCreation.status()}`
> 92  |     ).toBeTruthy();
      |       ^ Error: La création de réservation a échoué : HTTP 409
  93  | 
  94  |     await expect(
  95  |         page.getByText("Réservation créée avec succès.")
  96  |     ).toBeVisible({
  97  |         timeout: 10_000
  98  |     });
  99  | 
  100 |     await expect(
  101 |         page.getByRole("cell", {
  102 |             name: "20/12/2026 09:00",
  103 |             exact: true
  104 |         }).last()
  105 |     ).toBeVisible({
  106 |         timeout: 10_000
  107 |     });
  108 | 
  109 |     await expect(
  110 |         page.getByRole("cell", {
  111 |             name: "20/12/2026 17:00",
  112 |             exact: true
  113 |         }).last()
  114 |     ).toBeVisible({
  115 |         timeout: 10_000
  116 |     });
  117 | });
```