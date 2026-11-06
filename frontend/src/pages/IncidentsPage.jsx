import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

const API_INCIDENTS = "http://localhost:5236/api/Incident";
const API_VEHICULES = "http://localhost:5236/api/Vehicule";

const incidentVide = {
    typeIncident: "",
    description: "",
    gravite: "Moyenne",
    dateIncident: "",
    idVehicule: ""
};

export default function IncidentsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { afficherNotification } = useNotification();

    const vehiculeIdDansUrl = Number(searchParams.get("vehicule"));

    const [incidents, setIncidents] = useState([]);
    const [vehicules, setVehicules] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    const [recherche, setRecherche] = useState("");
    const [graviteFiltre, setGraviteFiltre] = useState("");
    const [statutFiltre, setStatutFiltre] = useState("");

    const [afficherFormulaireAjout, setAfficherFormulaireAjout] =
        useState(false);
    const [nouvelIncident, setNouvelIncident] = useState(incidentVide);
    const [ajoutEnCours, setAjoutEnCours] = useState(false);
    const [erreurAjout, setErreurAjout] = useState("");

    const [incidentEnModification, setIncidentEnModification] =
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

    const formulaireIncidentValide = (incident) => {
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

            const [reponseIncidents, reponseVehicules] =
                await Promise.all([
                    fetch(API_INCIDENTS, { headers }),
                    fetch(API_VEHICULES, { headers })
                ]);

            if (
                estNonAutorise(reponseIncidents) ||
                estNonAutorise(reponseVehicules)
            ) {
                return;
            }

            if (!reponseIncidents.ok) {
                setErreur(
                    await lireReponseErreur(
                        reponseIncidents,
                        "Impossible de charger les incidents."
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

            const donneesIncidents = await reponseIncidents.json();
            const donneesVehicules = await reponseVehicules.json();

            setIncidents(donneesIncidents);
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

        setNouvelIncident({
            ...incidentVide,
            idVehicule: vehiculeIdDansUrl
        });

        setErreurAjout("");
        setAfficherFormulaireAjout(true);
    }, [vehiculeIdDansUrl]);

    const getGraviteClass = (gravite) => {
        switch (gravite) {
            case "Faible":
                return "incident-gravite low";
            case "Moyenne":
                return "incident-gravite medium";
            case "Élevée":
                return "incident-gravite high";
            default:
                return "incident-gravite pending";
        }
    };

    const getStatusClass = (statut) => {
        switch (statut) {
            case "Ouvert":
                return "incident-status open";
            case "En cours":
                return "incident-status progress";
            case "Résolu":
                return "incident-status resolved";
            default:
                return "incident-status pending";
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

        setNouvelIncident((ancienIncident) => ({
            ...ancienIncident,
            [name]: name === "idVehicule" ? Number(value) : value
        }));
    };

    const ouvrirAjout = () => {
        setNouvelIncident(incidentVide);
        setErreurAjout("");
        setAfficherFormulaireAjout(true);
    };

    const fermerAjout = () => {
        if (!ajoutEnCours) {
            setAfficherFormulaireAjout(false);
            setErreurAjout("");

            if (vehiculeIdDansUrl > 0) {
                navigate("/incidents");
            }
        }
    };

    const ajouterIncident = async (event) => {
        event.preventDefault();
        setErreurAjout("");

        if (!formulaireIncidentValide(nouvelIncident)) {
            setErreurAjout(
                "Complète tous les champs obligatoires avant d’enregistrer l’incident."
            );
            return;
        }

        setAjoutEnCours(true);

        try {
            const response = await fetch(API_INCIDENTS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify(nouvelIncident)
            });

            if (estNonAutorise(response)) {
                return;
            }

            if (!response.ok) {
                setErreurAjout(
                    await lireReponseErreur(
                        response,
                        "Impossible de déclarer cet incident."
                    )
                );
                return;
            }
            setAfficherFormulaireAjout(false);
            navigate("/incidents");

            afficherNotification("Incident déclaré avec succès.");

            await chargerDonnees();
           
        } catch {
            setErreurAjout(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setAjoutEnCours(false);
        }
    };

    const ouvrirModification = (incident) => {
        setErreurModification("");

        setIncidentEnModification({
            id: incident.id,
            typeIncident: incident.typeIncident || "",
            description: incident.description || "",
            gravite: incident.gravite || "Moyenne",
            dateIncident: convertirDatePourInput(incident.dateIncident),
            statut: incident.statut || "Ouvert",
            idVehicule: incident.idVehicule
        });
    };

    const fermerModification = () => {
        if (!modificationEnCours) {
            setIncidentEnModification(null);
            setErreurModification("");
        }
    };

    const handleModificationChange = (event) => {
        const { name, value } = event.target;

        setIncidentEnModification((ancienIncident) => ({
            ...ancienIncident,
            [name]: name === "idVehicule" ? Number(value) : value
        }));
    };

    const modifierIncident = async (event) => {
        event.preventDefault();
        setErreurModification("");

        if (!formulaireIncidentValide(incidentEnModification)) {
            setErreurModification(
                "Complète tous les champs obligatoires avant d’enregistrer les modifications."
            );
            return;
        }

        setModificationEnCours(true);

        try {
            const response = await fetch(
                `${API_INCIDENTS}/${incidentEnModification.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(incidentEnModification)
                }
            );

            if (estNonAutorise(response)) {
                return;
            }

            if (!response.ok) {
                setErreurModification(
                    await lireReponseErreur(
                        response,
                        "Impossible de modifier cet incident."
                    )
                );
                return;
            }

            setIncidentEnModification(null);
            await chargerDonnees();
        } catch {
            setErreurModification(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setModificationEnCours(false);
        }
    };

    const supprimerIncident = async (incident) => {
        const confirmation = window.confirm(
            `Voulez-vous vraiment supprimer l’incident "${incident.typeIncident}" ?`
        );

        if (!confirmation) {
            return;
        }

        setErreur("");

        try {
            const response = await fetch(
                `${API_INCIDENTS}/${incident.id}`,
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
                        "Impossible de supprimer cet incident."
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

    const incidentsFiltres = incidents.filter((incident) => {
        const texte = recherche.toLowerCase();

        const correspondRecherche =
            (incident.vehicule || "").toLowerCase().includes(texte) ||
            (incident.typeIncident || "").toLowerCase().includes(texte) ||
            (incident.description || "").toLowerCase().includes(texte);

        const correspondGravite =
            graviteFiltre === "" || incident.gravite === graviteFiltre;

        const correspondStatut =
            statutFiltre === "" || incident.statut === statutFiltre;

        return (
            correspondRecherche &&
            correspondGravite &&
            correspondStatut
        );
    });

    const ajoutValide = formulaireIncidentValide(nouvelIncident);
    const modificationValide = formulaireIncidentValide(
        incidentEnModification
    );

    return (
        <div className="incidents-page">
            <div className="incidents-header">
                <h1>Incidents</h1>

                <button
                    className="add-incident-btn"
                    onClick={ouvrirAjout}
                >
                    + Déclarer un incident
                </button>
            </div>

            <div className="incidents-toolbar">
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
                        value={graviteFiltre}
                        onChange={(event) =>
                            setGraviteFiltre(event.target.value)
                        }
                    >
                        <option value="">Toutes les gravités</option>
                        <option value="Faible">Faible</option>
                        <option value="Moyenne">Moyenne</option>
                        <option value="Élevée">Élevée</option>
                    </select>

                    <select
                        value={statutFiltre}
                        onChange={(event) =>
                            setStatutFiltre(event.target.value)
                        }
                    >
                        <option value="">Tous les statuts</option>
                        <option value="Ouvert">Ouvert</option>
                        <option value="En cours">En cours</option>
                        <option value="Résolu">Résolu</option>
                    </select>
                </div>
            </div>

            {afficherFormulaireAjout && (
                <div className="utilisateur-form-card">
                    <div className="utilisateur-form-header">
                        <h2>Déclarer un incident</h2>

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
                        onSubmit={ajouterIncident}
                    >
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Véhicule</label>

                                <select
                                    name="idVehicule"
                                    value={nouvelIncident.idVehicule}
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
                                <label>Type d’incident</label>

                                <input
                                    type="text"
                                    name="typeIncident"
                                    placeholder="Ex. Pneu crevé"
                                    value={nouvelIncident.typeIncident}
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Gravité</label>

                                <select
                                    name="gravite"
                                    value={nouvelIncident.gravite}
                                    onChange={handleAjoutChange}
                                    required
                                >
                                    <option value="Faible">Faible</option>
                                    <option value="Moyenne">Moyenne</option>
                                    <option value="Élevée">Élevée</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Date et heure de déclaration</label>

                                <input
                                    type="datetime-local"
                                    name="dateIncident"
                                    value={nouvelIncident.dateIncident}
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Description</label>

                                <textarea
                                    name="description"
                                    placeholder="Décrire l’incident..."
                                    value={nouvelIncident.description}
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>
                        </div>

                        {!ajoutValide && (
                            <p className="login-error">
                                Complète tous les champs obligatoires avant
                                d’enregistrer l’incident.
                            </p>
                        )}

                        {erreurAjout && (
                            <p className="login-error">{erreurAjout}</p>
                        )}

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="add-incident-btn"
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

            {incidentEnModification && (
                <div className="utilisateur-form-card">
                    <div className="utilisateur-form-header">
                        <h2>Modifier un incident</h2>

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
                        onSubmit={modifierIncident}
                    >
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Véhicule</label>

                                <select
                                    name="idVehicule"
                                    value={incidentEnModification.idVehicule}
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
                                <label>Type d’incident</label>

                                <input
                                    type="text"
                                    name="typeIncident"
                                    value={
                                        incidentEnModification.typeIncident
                                    }
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Gravité</label>

                                <select
                                    name="gravite"
                                    value={incidentEnModification.gravite}
                                    onChange={handleModificationChange}
                                    required
                                >
                                    <option value="Faible">Faible</option>
                                    <option value="Moyenne">Moyenne</option>
                                    <option value="Élevée">Élevée</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Date et heure de déclaration</label>

                                <input
                                    type="datetime-local"
                                    name="dateIncident"
                                    value={incidentEnModification.dateIncident}
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Statut</label>

                                <select
                                    name="statut"
                                    value={incidentEnModification.statut}
                                    onChange={handleModificationChange}
                                    required
                                >
                                    <option value="Ouvert">Ouvert</option>
                                    <option value="En cours">En cours</option>
                                    <option value="Résolu">Résolu</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Description</label>

                                <textarea
                                    name="description"
                                    value={incidentEnModification.description}
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>
                        </div>

                        {!modificationValide && (
                            <p className="login-error">
                                Complète tous les champs obligatoires avant
                                d’enregistrer les modifications.
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
                                className="add-incident-btn"
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

            <div className="incidents-table-card">
                {chargement && (
                    <p className="table-note">
                        Chargement des incidents...
                    </p>
                )}

                {erreur && <p className="login-error">{erreur}</p>}

                {!chargement && !erreur && (
                    <div className="table-wrapper">
                        <table className="incidents-table">
                            <thead>
                                <tr>
                                    <th>Véhicule</th>
                                    <th>Type</th>
                                    <th>Gravité</th>
                                    <th>Date déclaration</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {incidentsFiltres.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            Aucun incident trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    incidentsFiltres.map((incident) => (
                                        <tr key={incident.id}>
                                            <td>{incident.vehicule}</td>
                                            <td>{incident.typeIncident}</td>
                                            <td>
                                                <span
                                                    className={getGraviteClass(
                                                        incident.gravite
                                                    )}
                                                >
                                                    {incident.gravite}
                                                </span>
                                            </td>
                                            <td>
                                                {formaterDate(
                                                    incident.dateIncident
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        incident.statut
                                                    )}
                                                >
                                                    {incident.statut}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="incident-actions">
                                                    <button
                                                        title="Modifier"
                                                        onClick={() =>
                                                            ouvrirModification(
                                                                incident
                                                            )
                                                        }
                                                    >
                                                        ✏️
                                                    </button>

                                                    <button
                                                        title="Supprimer"
                                                        onClick={() =>
                                                            supprimerIncident(
                                                                incident
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

                <div className="incidents-footer">
                    <p className="table-note">
                        {incidents.length} incident(s) chargé(s) depuis l’API.
                    </p>
                </div>
            </div>
        </div>
    );
}