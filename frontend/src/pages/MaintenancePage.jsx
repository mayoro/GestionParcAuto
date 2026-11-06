import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

const API_MAINTENANCES = "http://localhost:5236/api/Maintenance";
const API_VEHICULES = "http://localhost:5236/api/Vehicule";

const maintenanceVide = {
    typeIntervention: "",
    description: "",
    dateMaintenance: "",
    cout: 0,
    idVehicule: ""
};

export default function MaintenancePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { afficherNotification } = useNotification();

    const vehiculeIdDansUrl = Number(searchParams.get("vehicule"));

    const [maintenances, setMaintenances] = useState([]);
    const [vehicules, setVehicules] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    const [recherche, setRecherche] = useState("");
    const [statutFiltre, setStatutFiltre] = useState("");
    const [periodeFiltre, setPeriodeFiltre] = useState("");

    const [afficherFormulaireAjout, setAfficherFormulaireAjout] =
        useState(false);
    const [nouvelleMaintenance, setNouvelleMaintenance] =
        useState(maintenanceVide);
    const [ajoutEnCours, setAjoutEnCours] = useState(false);
    const [erreurAjout, setErreurAjout] = useState("");

    const [maintenanceEnModification, setMaintenanceEnModification] =
        useState(null);
    const [modificationEnCours, setModificationEnCours] = useState(false);
    const [erreurModification, setErreurModification] = useState("");

    const getToken = () => localStorage.getItem("token");

    const deconnecter = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("utilisateur");
        navigate("/");
    };

    const lireReponseErreur = async (response, messageParDefaut) => {
        try {
            const data = await response.json();
            return data.message || messageParDefaut;
        } catch {
            return messageParDefaut;
        }
    };

    const estNonAutorise = (response) => {
        if (response.status === 401 || response.status === 403) {
            deconnecter();
            return true;
        }

        return false;
    };

    const formulaireMaintenanceValide = (maintenance) => {
        if (!maintenance) {
            return false;
        }

        return (
            String(maintenance.typeIntervention || "").trim() !== "" &&
            String(maintenance.description || "").trim() !== "" &&
            String(maintenance.dateMaintenance || "").trim() !== "" &&
            Number(maintenance.idVehicule) > 0 &&
            Number.isFinite(Number(maintenance.cout)) &&
            Number(maintenance.cout) >= 0
        );
    };

    const chargerDonnees = async () => {
        const token = getToken();

        if (!token) {
            navigate("/");
            return;
        }

        setChargement(true);
        setErreur("");

        try {
            const headers = {
                Authorization: `Bearer ${token}`
            };

            const [reponseMaintenances, reponseVehicules] =
                await Promise.all([
                    fetch(API_MAINTENANCES, { headers }),
                    fetch(API_VEHICULES, { headers })
                ]);

            if (
                estNonAutorise(reponseMaintenances) ||
                estNonAutorise(reponseVehicules)
            ) {
                return;
            }

            if (!reponseMaintenances.ok) {
                setErreur(
                    await lireReponseErreur(
                        reponseMaintenances,
                        "Impossible de charger les maintenances."
                    )
                );
                return;
            }

            if (!reponseVehicules.ok) {
                setErreur(
                    await lireReponseErreur(
                        reponseVehicules,
                        "Impossible de charger les véhicules."
                    )
                );
                return;
            }

            const donneesMaintenances =
                await reponseMaintenances.json();
            const donneesVehicules = await reponseVehicules.json();

            setMaintenances(donneesMaintenances);
            setVehicules(donneesVehicules);
        } catch {
            setErreur(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        chargerDonnees();
    }, []);

    useEffect(() => {
        if (!Number.isInteger(vehiculeIdDansUrl) || vehiculeIdDansUrl <= 0) {
            return;
        }

        setNouvelleMaintenance({
            ...maintenanceVide,
            idVehicule: vehiculeIdDansUrl
        });

        setErreurAjout("");
        setAfficherFormulaireAjout(true);
    }, [vehiculeIdDansUrl]);

    const getStatusClass = (statut) => {
        switch (statut) {
            case "Planifiée":
                return "maintenance-status planned";
            case "En cours":
                return "maintenance-status progress";
            case "Terminée":
                return "maintenance-status completed";
            case "Annulée":
                return "maintenance-status canceled";
            default:
                return "maintenance-status pending";
        }
    };

    const formaterDate = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const convertirDatePourInput = (date) => {
        if (!date) {
            return "";
        }

        const dateObj = new Date(date);
        const decalage = dateObj.getTimezoneOffset() * 60000;

        return new Date(dateObj.getTime() - decalage)
            .toISOString()
            .slice(0, 16);
    };

    const handleAjoutChange = (event) => {
        const { name, value } = event.target;

        setNouvelleMaintenance((ancienneMaintenance) => ({
            ...ancienneMaintenance,
            [name]:
                name === "idVehicule" || name === "cout"
                    ? Number(value)
                    : value
        }));
    };

    const ouvrirAjout = () => {
        setNouvelleMaintenance(maintenanceVide);
        setErreurAjout("");
        setAfficherFormulaireAjout(true);
    };

    const fermerAjout = () => {
        if (!ajoutEnCours) {
            setAfficherFormulaireAjout(false);
            setErreurAjout("");
        }
    };

    const ajouterMaintenance = async (event) => {
        event.preventDefault();
        setErreurAjout("");

        if (!formulaireMaintenanceValide(nouvelleMaintenance)) {
            setErreurAjout(
                "Complète tous les champs obligatoires et indique un coût positif ou égal à zéro."
            );
            return;
        }

        setAjoutEnCours(true);

        try {
            const response = await fetch(API_MAINTENANCES, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify(nouvelleMaintenance)
            });

            if (estNonAutorise(response)) {
                return;
            }

            if (!response.ok) {
                setErreurAjout(
                    await lireReponseErreur(
                        response,
                        "Impossible de planifier cette maintenance."
                    )
                );
                return;
            }

            setAfficherFormulaireAjout(false);
            navigate("/maintenance");
            afficherNotification("Maintenance planifiée avec succès.");
            await chargerDonnees();
        } catch {
            setErreurAjout(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setAjoutEnCours(false);
        }
    };

    const ouvrirModification = (maintenance) => {
        setErreurModification("");

        setMaintenanceEnModification({
            idMaintenance: maintenance.idMaintenance,
            typeIntervention: maintenance.typeIntervention || "",
            description: maintenance.description || "",
            dateMaintenance: convertirDatePourInput(
                maintenance.dateMaintenance
            ),
            cout: maintenance.cout ?? 0,
            statut: maintenance.statut || "Planifiée",
            idVehicule: maintenance.idVehicule
        });
    };

    const fermerModification = () => {
        if (!modificationEnCours) {
            setMaintenanceEnModification(null);
            setErreurModification("");
        }
    };

    const handleModificationChange = (event) => {
        const { name, value } = event.target;

        setMaintenanceEnModification((ancienneMaintenance) => ({
            ...ancienneMaintenance,
            [name]:
                name === "idVehicule" || name === "cout"
                    ? Number(value)
                    : value
        }));
    };

    const modifierMaintenance = async (event) => {
        event.preventDefault();
        setErreurModification("");

        if (!formulaireMaintenanceValide(maintenanceEnModification)) {
            setErreurModification(
                "Complète tous les champs obligatoires et indique un coût positif ou égal à zéro."
            );
            return;
        }

        setModificationEnCours(true);

        try {
            const response = await fetch(
                `${API_MAINTENANCES}/${maintenanceEnModification.idMaintenance}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(maintenanceEnModification)
                }
            );

            if (estNonAutorise(response)) {
                return;
            }

            if (!response.ok) {
                setErreurModification(
                    await lireReponseErreur(
                        response,
                        "Impossible de modifier cette maintenance."
                    )
                );
                return;
            }

            setMaintenanceEnModification(null);
            await chargerDonnees();
        } catch {
            setErreurModification(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setModificationEnCours(false);
        }
    };

    const supprimerMaintenance = async (maintenance) => {
        const confirmation = window.confirm(
            `Voulez-vous vraiment supprimer la maintenance "${maintenance.typeIntervention}" ?`
        );

        if (!confirmation) {
            return;
        }

        setErreur("");

        try {
            const response = await fetch(
                `${API_MAINTENANCES}/${maintenance.idMaintenance}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );

            if (estNonAutorise(response)) {
                return;
            }

            if (!response.ok) {
                setErreur(
                    await lireReponseErreur(
                        response,
                        "Impossible de supprimer cette maintenance."
                    )
                );
                return;
            }

            await chargerDonnees();
        } catch {
            setErreur(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        }
    };

    const estDansPeriode = (maintenance) => {
        if (!periodeFiltre) {
            return true;
        }

        const maintenant = new Date();
        const dateMaintenance = new Date(maintenance.dateMaintenance);

        if (periodeFiltre === "semaine") {
            const debutSemaine = new Date(maintenant);

            debutSemaine.setDate(
                maintenant.getDate() - maintenant.getDay() + 1
            );
            debutSemaine.setHours(0, 0, 0, 0);

            const finSemaine = new Date(debutSemaine);
            finSemaine.setDate(debutSemaine.getDate() + 7);

            return (
                dateMaintenance >= debutSemaine &&
                dateMaintenance < finSemaine
            );
        }

        if (periodeFiltre === "mois") {
            return (
                dateMaintenance.getMonth() === maintenant.getMonth() &&
                dateMaintenance.getFullYear() === maintenant.getFullYear()
            );
        }

        if (periodeFiltre === "annee") {
            return (
                dateMaintenance.getFullYear() === maintenant.getFullYear()
            );
        }

        return true;
    };

    const maintenancesFiltrees = maintenances.filter((maintenance) => {
        const texte = recherche.toLowerCase();

        const correspondRecherche =
            (maintenance.vehicule || "").toLowerCase().includes(texte) ||
            (maintenance.typeIntervention || "")
                .toLowerCase()
                .includes(texte) ||
            (maintenance.description || "")
                .toLowerCase()
                .includes(texte);

        const correspondStatut =
            statutFiltre === "" ||
            maintenance.statut === statutFiltre;

        return (
            correspondRecherche &&
            correspondStatut &&
            estDansPeriode(maintenance)
        );
    });

    const ajoutValide = formulaireMaintenanceValide(nouvelleMaintenance);

    const modificationValide = formulaireMaintenanceValide(
        maintenanceEnModification
    );

    return (
        <div className="maintenance-page">
            <div className="maintenance-header">
                <h1>Maintenance</h1>

                <button
                    className="add-maintenance-btn"
                    onClick={ouvrirAjout}
                >
                    + Planifier maintenance
                </button>
            </div>

            <div className="maintenance-toolbar">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={recherche}
                        onChange={(event) => setRecherche(event.target.value)}
                    />
                </div>

                <div className="toolbar-actions">
                    <select
                        value={statutFiltre}
                        onChange={(event) =>
                            setStatutFiltre(event.target.value)
                        }
                    >
                        <option value="">Tous les statuts</option>
                        <option value="Planifiée">Planifiée</option>
                        <option value="En cours">En cours</option>
                        <option value="Terminée">Terminée</option>
                        <option value="Annulée">Annulée</option>
                    </select>

                    <select
                        value={periodeFiltre}
                        onChange={(event) =>
                            setPeriodeFiltre(event.target.value)
                        }
                    >
                        <option value="">Toutes les périodes</option>
                        <option value="semaine">Cette semaine</option>
                        <option value="mois">Ce mois</option>
                        <option value="annee">Cette année</option>
                    </select>
                </div>
            </div>

            {afficherFormulaireAjout && (
                <div className="utilisateur-form-card">
                    <div className="utilisateur-form-header">
                        <h2>Planifier une maintenance</h2>

                        <button
                            type="button"
                            className="form-close-btn"
                            onClick={fermerAjout}
                            disabled={ajoutEnCours}
                            title="Fermer"
                        >
                            ×
                        </button>
                    </div>

                    <form
                        className="utilisateur-form"
                        onSubmit={ajouterMaintenance}
                    >
                        <div className="form-grid">
                            <div className="form-field">
                                <label htmlFor="maintenance-vehicule">
                                    Véhicule
                                </label>

                                <select
                                    id="maintenance-vehicule"
                                    name="idVehicule"
                                    value={nouvelleMaintenance.idVehicule}
                                    onChange={handleAjoutChange}
                                    required
                                >
                                    <option value="">
                                        Sélectionner un véhicule
                                    </option>

                                    {vehicules.map((vehicule) => (
                                        <option
                                            key={vehicule.idVehicule}
                                            value={vehicule.idVehicule}
                                        >
                                            {vehicule.immatriculation} -{" "}
                                            {vehicule.marque} {vehicule.modele}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label htmlFor="maintenance-type-intervention">
                                    Type d’intervention
                                </label>

                                <input
                                    id="maintenance-type-intervention"
                                    type="text"
                                    name="typeIntervention"
                                    placeholder="Ex. Vidange"
                                    value={
                                        nouvelleMaintenance.typeIntervention
                                    }
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="maintenance-date">
                                    Date et heure prévues
                                </label>

                                <input
                                    id="maintenance-date"
                                    type="datetime-local"
                                    name="dateMaintenance"
                                    value={
                                        nouvelleMaintenance.dateMaintenance
                                    }
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="maintenance-cout">Coût</label>

                                <input
                                    id="maintenance-cout"
                                    type="number"
                                    name="cout"
                                    min="0"
                                    step="0.01"
                                    value={nouvelleMaintenance.cout}
                                    onChange={handleAjoutChange}
                                    required
                                />

                                {Number(nouvelleMaintenance.cout) < 0 && (
                                    <p className="login-error">
                                        Le coût ne peut pas être négatif.
                                    </p>
                                )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="maintenance-description">
                                    Description
                                </label>

                                <textarea
                                    id="maintenance-description"
                                    name="description"
                                    placeholder="Décrire l’intervention..."
                                    value={nouvelleMaintenance.description}
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>
                        </div>

                        {!ajoutValide && (
                            <p className="login-error">
                                Complète tous les champs obligatoires. Le coût
                                doit être positif ou égal à zéro.
                            </p>
                        )}

                        {erreurAjout && (
                            <p className="login-error">{erreurAjout}</p>
                        )}

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="add-maintenance-btn"
                                disabled={ajoutEnCours || !ajoutValide}
                            >
                                {ajoutEnCours
                                    ? "Enregistrement..."
                                    : "Enregistrer"}
                            </button>

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={fermerAjout}
                                disabled={ajoutEnCours}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {maintenanceEnModification && (
                <div className="utilisateur-form-card">
                    <div className="utilisateur-form-header">
                        <h2>Modifier une maintenance</h2>

                        <button
                            type="button"
                            className="form-close-btn"
                            onClick={fermerModification}
                            disabled={modificationEnCours}
                            title="Fermer"
                        >
                            ×
                        </button>
                    </div>

                    <form
                        className="utilisateur-form"
                        onSubmit={modifierMaintenance}
                    >
                        <div className="form-grid">
                            <div className="form-field">
                                <label htmlFor="modification-vehicule">
                                    Véhicule
                                </label>

                                <select
                                    id="modification-vehicule"
                                    name="idVehicule"
                                    value={
                                        maintenanceEnModification.idVehicule
                                    }
                                    onChange={handleModificationChange}
                                    required
                                >
                                    <option value="">
                                        Sélectionner un véhicule
                                    </option>

                                    {vehicules.map((vehicule) => (
                                        <option
                                            key={vehicule.idVehicule}
                                            value={vehicule.idVehicule}
                                        >
                                            {vehicule.immatriculation} -{" "}
                                            {vehicule.marque} {vehicule.modele}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label htmlFor="modification-type-intervention">
                                    Type d’intervention
                                </label>

                                <input
                                    id="modification-type-intervention"
                                    type="text"
                                    name="typeIntervention"
                                    value={
                                        maintenanceEnModification.typeIntervention
                                    }
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="modification-date">
                                    Date et heure prévues
                                </label>

                                <input
                                    id="modification-date"
                                    type="datetime-local"
                                    name="dateMaintenance"
                                    value={
                                        maintenanceEnModification.dateMaintenance
                                    }
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="modification-cout">
                                    Coût
                                </label>

                                <input
                                    id="modification-cout"
                                    type="number"
                                    name="cout"
                                    min="0"
                                    step="0.01"
                                    value={maintenanceEnModification.cout}
                                    onChange={handleModificationChange}
                                    required
                                />

                                {Number(maintenanceEnModification.cout) <
                                    0 && (
                                        <p className="login-error">
                                            Le coût ne peut pas être négatif.
                                        </p>
                                    )}
                            </div>

                            <div className="form-field">
                                <label htmlFor="modification-statut">
                                    Statut
                                </label>

                                <select
                                    id="modification-statut"
                                    name="statut"
                                    value={maintenanceEnModification.statut}
                                    onChange={handleModificationChange}
                                    required
                                >
                                    <option value="Planifiée">
                                        Planifiée
                                    </option>
                                    <option value="En cours">En cours</option>
                                    <option value="Terminée">Terminée</option>
                                    <option value="Annulée">Annulée</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label htmlFor="modification-description">
                                    Description
                                </label>

                                <textarea
                                    id="modification-description"
                                    name="description"
                                    value={
                                        maintenanceEnModification.description
                                    }
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>
                        </div>

                        {!modificationValide && (
                            <p className="login-error">
                                Complète tous les champs obligatoires. Le coût
                                doit être positif ou égal à zéro.
                            </p>
                        )}

                        {erreurModification && (
                            <p className="login-error">
                                {erreurModification}
                            </p>
                        )}

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="add-maintenance-btn"
                                disabled={
                                    modificationEnCours ||
                                    !modificationValide
                                }
                            >
                                {modificationEnCours
                                    ? "Modification..."
                                    : "Enregistrer les modifications"}
                            </button>

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={fermerModification}
                                disabled={modificationEnCours}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="maintenance-table-card">
                {chargement && (
                    <p className="table-note">
                        Chargement des maintenances...
                    </p>
                )}

                {erreur && <p className="login-error">{erreur}</p>}

                {!chargement && !erreur && (
                    <div className="table-wrapper">
                        <table className="maintenance-table">
                            <thead>
                                <tr>
                                    <th>Véhicule</th>
                                    <th>Type</th>
                                    <th>Date planifiée</th>
                                    <th>Coût</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {maintenancesFiltrees.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            Aucune maintenance trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    maintenancesFiltrees.map((maintenance) => (
                                        <tr key={maintenance.idMaintenance}>
                                            <td>{maintenance.vehicule}</td>
                                            <td>
                                                {maintenance.typeIntervention}
                                            </td>
                                            <td>
                                                {formaterDate(
                                                    maintenance.dateMaintenance
                                                )}
                                            </td>
                                            <td>
                                                {Number(
                                                    maintenance.cout
                                                ).toLocaleString("fr-FR", {
                                                    style: "currency",
                                                    currency: "EUR"
                                                })}
                                            </td>
                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        maintenance.statut
                                                    )}
                                                >
                                                    {maintenance.statut}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="maintenance-actions">
                                                    <button
                                                        title="Modifier"
                                                        onClick={() =>
                                                            ouvrirModification(
                                                                maintenance
                                                            )
                                                        }
                                                    >
                                                        ✏️
                                                    </button>

                                                    <button
                                                        title="Supprimer"
                                                        onClick={() =>
                                                            supprimerMaintenance(
                                                                maintenance
                                                            )
                                                        }
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="maintenance-footer">
                    <p className="table-note">
                        {maintenances.length} maintenance(s) chargée(s) depuis
                        l’API.
                    </p>
                </div>
            </div>
        </div>
    );
}