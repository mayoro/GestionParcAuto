import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

const API_URL = "http://localhost:5236/api/Vehicule";
const API_RESERVATIONS = "http://localhost:5236/api/Reservation";
const API_MAINTENANCES = "http://localhost:5236/api/Maintenance";
const API_INCIDENTS = "http://localhost:5236/api/Incident";

const vehiculeVide = {
    immatriculation: "",
    marque: "",
    modele: "",
    annee: new Date().getFullYear(),
    kilometrage: 0,
    statut: "Disponible"
};

export default function VehiculesPage() {
    const navigate = useNavigate();
    const { afficherNotification } = useNotification();

    const [vehicules, setVehicules] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    const [recherche, setRecherche] = useState("");
    const [statutFiltre, setStatutFiltre] = useState("");

    const [afficherFormulaireAjout, setAfficherFormulaireAjout] =
        useState(false);
    const [nouveauVehicule, setNouveauVehicule] =
        useState(vehiculeVide);
    const [ajoutEnCours, setAjoutEnCours] = useState(false);
    const [erreurAjout, setErreurAjout] = useState("");

    const [vehiculeEnModification, setVehiculeEnModification] =
        useState(null);
    const [modificationEnCours, setModificationEnCours] =
        useState(false);
    const [erreurModification, setErreurModification] =
        useState("");

    const [vehiculeEnDetail, setVehiculeEnDetail] = useState(null);
    const [historiqueVehicule, setHistoriqueVehicule] = useState({
        reservations: [],
        maintenances: [],
        incidents: []
    });
    const [chargementDetail, setChargementDetail] = useState(false);
    const [erreurDetail, setErreurDetail] = useState("");

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

    const chargerVehicules = async () => {
        const token = getToken();

        if (!token) {
            navigate("/");
            return;
        }

        setChargement(true);
        setErreur("");

        try {
            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                deconnecter();
                return;
            }

            if (!response.ok) {
                setErreur(
                    await lireReponseErreur(
                        response,
                        "Impossible de charger les véhicules."
                    )
                );
                return;
            }

            const data = await response.json();
            setVehicules(data);
        } catch {
            setErreur(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        chargerVehicules();
    }, []);

    const getStatusClass = (statut) => {
        switch (statut) {
            case "Disponible":
                return "vehicle-status available";
            case "Réservé":
                return "vehicle-status reserved";
            case "En maintenance":
                return "vehicle-status maintenance";
            default:
                return "vehicle-status pending";
        }
    };

    const handleAjoutChange = (event) => {
        const { name, value } = event.target;

        setNouveauVehicule((ancienVehicule) => ({
            ...ancienVehicule,
            [name]:
                name === "annee" || name === "kilometrage"
                    ? Number(value)
                    : value
        }));
    };

    const ouvrirAjout = () => {
        setNouveauVehicule(vehiculeVide);
        setErreurAjout("");
        setAfficherFormulaireAjout(true);
    };

    const fermerAjout = () => {
        if (!ajoutEnCours) {
            setAfficherFormulaireAjout(false);
            setErreurAjout("");
        }
    };

    const ajouterVehicule = async (event) => {
        event.preventDefault();
        setErreurAjout("");
        setAjoutEnCours(true);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify(nouveauVehicule)
            });

            if (response.status === 401 || response.status === 403) {
                deconnecter();
                return;
            }

            if (!response.ok) {
                setErreurAjout(
                    await lireReponseErreur(
                        response,
                        "Impossible d’ajouter ce véhicule."
                    )
                );
                return;
            }
            setAfficherFormulaireAjout(false);
            afficherNotification("Véhicule ajouté avec succès.");
            await chargerVehicules();
            
        } catch {
            setErreurAjout(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setAjoutEnCours(false);
        }
    };

    const ouvrirModification = (vehicule) => {
        setErreurModification("");

        setVehiculeEnModification({
            idVehicule: vehicule.idVehicule,
            immatriculation: vehicule.immatriculation || "",
            marque: vehicule.marque || "",
            modele: vehicule.modele || "",
            annee: vehicule.annee || new Date().getFullYear(),
            kilometrage: vehicule.kilometrage || 0,
            statut: vehicule.statut || "Disponible"
        });
    };

    const fermerModification = () => {
        if (!modificationEnCours) {
            setVehiculeEnModification(null);
            setErreurModification("");
        }
    };

    const handleModificationChange = (event) => {
        const { name, value } = event.target;

        setVehiculeEnModification((ancienVehicule) => ({
            ...ancienVehicule,
            [name]:
                name === "annee" || name === "kilometrage"
                    ? Number(value)
                    : value
        }));
    };

    const modifierVehicule = async (event) => {
        event.preventDefault();
        setErreurModification("");
        setModificationEnCours(true);

        try {
            const response = await fetch(
                `${API_URL}/${vehiculeEnModification.idVehicule}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(vehiculeEnModification)
                }
            );

            if (response.status === 401 || response.status === 403) {
                deconnecter();
                return;
            }

            if (!response.ok) {
                setErreurModification(
                    await lireReponseErreur(
                        response,
                        "Impossible de modifier ce véhicule."
                    )
                );
                return;
            }

            setVehiculeEnModification(null);
            afficherNotification("Véhicule modifié avec succès.");
            await chargerVehicules();
        } catch {
            setErreurModification(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setModificationEnCours(false);
        }
    };

    const supprimerVehicule = async (vehicule) => {
        const confirmation = window.confirm(
            `Voulez-vous vraiment supprimer le véhicule ${vehicule.immatriculation} ?`
        );

        if (!confirmation) {
            return;
        }

        setErreur("");

        try {
            const response = await fetch(
                `${API_URL}/${vehicule.idVehicule}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );

            if (response.status === 401 || response.status === 403) {
                deconnecter();
                return;
            }

            if (!response.ok) {
                setErreur(
                    await lireReponseErreur(
                        response,
                        "Impossible de supprimer ce véhicule."
                    )
                );
                return;
            }

            afficherNotification("Véhicule supprimé avec succès.");

            await chargerVehicules();
        } catch {
            setErreur(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        }
    };

    const ouvrirDetail = async (vehicule) => {
        setVehiculeEnDetail(vehicule);
        setErreurDetail("");
        setChargementDetail(true);

        try {
            const headers = {
                Authorization: `Bearer ${getToken()}`
            };

            const [
                reponseReservations,
                reponseMaintenances,
                reponseIncidents
            ] = await Promise.all([
                fetch(API_RESERVATIONS, { headers }),
                fetch(API_MAINTENANCES, { headers }),
                fetch(API_INCIDENTS, { headers })
            ]);

            if (
                reponseReservations.status === 401 ||
                reponseReservations.status === 403 ||
                reponseMaintenances.status === 401 ||
                reponseMaintenances.status === 403 ||
                reponseIncidents.status === 401 ||
                reponseIncidents.status === 403
            ) {
                deconnecter();
                return;
            }

            if (
                !reponseReservations.ok ||
                !reponseMaintenances.ok ||
                !reponseIncidents.ok
            ) {
                setErreurDetail(
                    "Impossible de charger l’historique du véhicule."
                );
                return;
            }

            const reservations = await reponseReservations.json();
            const maintenances = await reponseMaintenances.json();
            const incidents = await reponseIncidents.json();

            setHistoriqueVehicule({
                reservations: reservations.filter(
                    (reservation) =>
                        reservation.idVehicule === vehicule.idVehicule
                ),
                maintenances: maintenances.filter(
                    (maintenance) =>
                        maintenance.idVehicule === vehicule.idVehicule
                ),
                incidents: incidents.filter(
                    (incident) =>
                        incident.idVehicule === vehicule.idVehicule
                )
            });
        } catch {
            setErreurDetail(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setChargementDetail(false);
        }
    };

    const fermerDetail = () => {
        setVehiculeEnDetail(null);
        setErreurDetail("");
        setHistoriqueVehicule({
            reservations: [],
            maintenances: [],
            incidents: []
        });
    };

    const allerVersActionVehicule = (page) => {
        if (!vehiculeEnDetail) {
            return;
        }

        navigate(`/${page}?vehicule=${vehiculeEnDetail.idVehicule}`);
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

    const vehiculesFiltres = vehicules.filter((vehicule) => {
        const texte = recherche.toLowerCase();

        const correspondRecherche =
            (vehicule.immatriculation || "").toLowerCase().includes(texte) ||
            (vehicule.marque || "").toLowerCase().includes(texte) ||
            (vehicule.modele || "").toLowerCase().includes(texte);

        const correspondStatut =
            statutFiltre === "" || vehicule.statut === statutFiltre;

        return correspondRecherche && correspondStatut;
    });

    const echapperCsv = (valeur) => {
        const texte = String(valeur ?? "");

        return `"${texte.replace(/"/g, '""')}"`;
    };

    const exporterVehiculesCsv = () => {
        if (vehiculesFiltres.length === 0) {
            afficherNotification(
                "Aucun véhicule à exporter.",
                "error"
            );
            return;
        }

        const entetes = [
            "Immatriculation",
            "Marque",
            "Modèle",
            "Année",
            "Kilométrage",
            "Statut"
        ];

        const lignes = vehiculesFiltres.map((vehicule) => [
            vehicule.immatriculation,
            vehicule.marque,
            vehicule.modele,
            vehicule.annee,
            vehicule.kilometrage,
            vehicule.statut
        ]);

        const contenuCsv = [
            entetes.map(echapperCsv).join(";"),
            ...lignes.map((ligne) => ligne.map(echapperCsv).join(";"))
        ].join("\n");

        const fichier = new Blob(
            [`\ufeff${contenuCsv}`],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(fichier);
        const lien = document.createElement("a");

        lien.href = url;
        lien.download = `vehicules-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

        document.body.appendChild(lien);
        lien.click();
        document.body.removeChild(lien);
        URL.revokeObjectURL(url);

        afficherNotification("Export CSV des véhicules téléchargé.");
    };

    return (
        <div className="vehicules-page">
            <div className="vehicules-header">
                <h1>Véhicules</h1>

                <div className="vehicules-header-actions">
                    <button
                        type="button"
                        className="export-csv-btn"
                        onClick={exporterVehiculesCsv}
                    >
                        ⬇ Exporter CSV
                    </button>

                    <button
                        type="button"
                        className="add-vehicle-btn"
                        onClick={ouvrirAjout}
                    >
                        + Ajouter un véhicule
                    </button>
                </div>
            </div>

            <div className="vehicules-toolbar">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={recherche}
                        onChange={(event) =>
                            setRecherche(event.target.value)
                        }
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
                        <option value="Disponible">Disponible</option>
                        <option value="Réservé">Réservé</option>
                        <option value="En maintenance">
                            En maintenance
                        </option>
                    </select>
                </div>
            </div>

            {afficherFormulaireAjout && (
                <div className="utilisateur-form-card">
                    <div className="utilisateur-form-header">
                        <h2>Ajouter un véhicule</h2>

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
                        onSubmit={ajouterVehicule}
                    >
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Immatriculation</label>
                                <input
                                    type="text"
                                    name="immatriculation"
                                    placeholder="Ex. AB-123-CD"
                                    value={nouveauVehicule.immatriculation}
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Marque</label>
                                <input
                                    type="text"
                                    name="marque"
                                    placeholder="Ex. Toyota"
                                    value={nouveauVehicule.marque}
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Modèle</label>
                                <input
                                    type="text"
                                    name="modele"
                                    placeholder="Ex. Corolla"
                                    value={nouveauVehicule.modele}
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Année</label>
                                <input
                                    type="number"
                                    name="annee"
                                    min="1900"
                                    max="2100"
                                    value={nouveauVehicule.annee}
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Kilométrage</label>
                                <input
                                    type="number"
                                    name="kilometrage"
                                    min="0"
                                    value={nouveauVehicule.kilometrage}
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Statut</label>
                                <select
                                    name="statut"
                                    value={nouveauVehicule.statut}
                                    onChange={handleAjoutChange}
                                >
                                    <option value="Disponible">
                                        Disponible
                                    </option>
                                    <option value="Réservé">Réservé</option>
                                    <option value="En maintenance">
                                        En maintenance
                                    </option>
                                </select>
                            </div>
                        </div>

                        {erreurAjout && (
                            <p className="login-error">{erreurAjout}</p>
                        )}

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="add-vehicle-btn"
                                disabled={ajoutEnCours}
                            >
                                {ajoutEnCours
                                    ? "Ajout en cours..."
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

            {vehiculeEnModification && (
                <div className="utilisateur-form-card">
                    <div className="utilisateur-form-header">
                        <h2>Modifier un véhicule</h2>

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
                        onSubmit={modifierVehicule}
                    >
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Immatriculation</label>
                                <input
                                    type="text"
                                    name="immatriculation"
                                    value={
                                        vehiculeEnModification.immatriculation
                                    }
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Marque</label>
                                <input
                                    type="text"
                                    name="marque"
                                    value={vehiculeEnModification.marque}
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Modèle</label>
                                <input
                                    type="text"
                                    name="modele"
                                    value={vehiculeEnModification.modele}
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Année</label>
                                <input
                                    type="number"
                                    name="annee"
                                    min="1900"
                                    max="2100"
                                    value={vehiculeEnModification.annee}
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Kilométrage</label>
                                <input
                                    type="number"
                                    name="kilometrage"
                                    min="0"
                                    value={
                                        vehiculeEnModification.kilometrage
                                    }
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Statut</label>
                                <select
                                    name="statut"
                                    value={vehiculeEnModification.statut}
                                    onChange={handleModificationChange}
                                >
                                    <option value="Disponible">
                                        Disponible
                                    </option>
                                    <option value="Réservé">Réservé</option>
                                    <option value="En maintenance">
                                        En maintenance
                                    </option>
                                </select>
                            </div>
                        </div>

                        {erreurModification && (
                            <p className="login-error">
                                {erreurModification}
                            </p>
                        )}

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="add-vehicle-btn"
                                disabled={modificationEnCours}
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

            <div className="vehicules-table-card">
                {chargement && (
                    <p className="table-note">
                        Chargement des véhicules...
                    </p>
                )}

                {erreur && <p className="login-error">{erreur}</p>}

                {!chargement && !erreur && (
                    <div className="table-wrapper">
                        <table className="vehicules-table">
                            <thead>
                                <tr>
                                    <th>Immatriculation</th>
                                    <th>Marque</th>
                                    <th>Modèle</th>
                                    <th>Statut</th>
                                    <th>Kilométrage</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {vehiculesFiltres.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            Aucun véhicule trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    vehiculesFiltres.map((vehicule) => (
                                        <tr key={vehicule.idVehicule}>
                                            <td>{vehicule.immatriculation}</td>
                                            <td>{vehicule.marque}</td>
                                            <td>{vehicule.modele}</td>
                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        vehicule.statut
                                                    )}
                                                >
                                                    {vehicule.statut}
                                                </span>
                                            </td>
                                            <td>
                                                {Number(
                                                    vehicule.kilometrage
                                                ).toLocaleString("fr-FR")} km
                                            </td>
                                            <td>
                                                <div className="vehicle-actions">
                                                    <button
                                                        title="Voir les détails"
                                                        onClick={() =>
                                                            ouvrirDetail(
                                                                vehicule
                                                            )
                                                        }
                                                    >
                                                        👁️
                                                    </button>

                                                    <button
                                                        title="Modifier"
                                                        onClick={() =>
                                                            ouvrirModification(
                                                                vehicule
                                                            )
                                                        }
                                                    >
                                                        ✏️
                                                    </button>

                                                    <button
                                                        title="Supprimer"
                                                        onClick={() =>
                                                            supprimerVehicule(
                                                                vehicule
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

                <div className="vehicules-footer">
                    <p className="table-note">
                        {vehicules.length} véhicule(s) chargé(s) depuis l’API.
                    </p>
                </div>
            </div>

            {vehiculeEnDetail && (
                <div
                    className="vehicle-detail-overlay"
                    onClick={fermerDetail}
                >
                    <div
                        className="vehicle-detail-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="vehicle-detail-header">
                            <div>
                                <h2>
                                    Véhicule{" "}
                                    {vehiculeEnDetail.immatriculation}
                                </h2>
                                <p>
                                    {vehiculeEnDetail.marque}{" "}
                                    {vehiculeEnDetail.modele}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="form-close-btn"
                                onClick={fermerDetail}
                                title="Fermer"
                            >
                                ×
                            </button>
                        </div>

                        <div className="vehicle-detail-info">
                            <div>
                                <span>Année</span>
                                <strong>{vehiculeEnDetail.annee}</strong>
                            </div>

                            <div>
                                <span>Kilométrage</span>
                                <strong>
                                    {Number(
                                        vehiculeEnDetail.kilometrage
                                    ).toLocaleString("fr-FR")} km
                                </strong>
                            </div>

                            <div>
                                <span>Statut</span>
                                <strong>{vehiculeEnDetail.statut}</strong>
                            </div>

                            <div>
                                <span>Immatriculation</span>
                                <strong>
                                    {vehiculeEnDetail.immatriculation}
                                </strong>
                            </div>
                        </div>

                        <div className="vehicle-detail-actions">
                            <button
                                type="button"
                                className="vehicle-detail-action reservation-action"
                                onClick={() => allerVersActionVehicule("reservations")}
                            >
                                + Nouvelle réservation
                            </button>

                            <button
                                type="button"
                                className="vehicle-detail-action maintenance-action"
                                onClick={() => allerVersActionVehicule("maintenance")}
                            >
                                + Planifier maintenance
                            </button>

                            <button
                                type="button"
                                className="vehicle-detail-action incident-action"
                                onClick={() => allerVersActionVehicule("incidents")}
                            >
                                + Déclarer incident
                            </button>
                        </div>

                        {chargementDetail && (
                            <p className="table-note">
                                Chargement de l’historique...
                            </p>
                        )}

                        {erreurDetail && (
                            <p className="login-error">{erreurDetail}</p>
                        )}

                        {!chargementDetail && !erreurDetail && (
                            <div className="vehicle-detail-history">
                                <section>
                                    <h3>
                                        Réservations (
                                        {
                                            historiqueVehicule.reservations
                                                .length
                                        }
                                        )
                                    </h3>

                                    {historiqueVehicule.reservations.length ===
                                        0 ? (
                                        <p className="table-note">
                                            Aucune réservation pour ce véhicule.
                                        </p>
                                    ) : (
                                        <div className="detail-list">
                                            {historiqueVehicule.reservations.map(
                                                (reservation) => (
                                                    <div
                                                        className="detail-item"
                                                        key={
                                                            reservation.idReservation
                                                        }
                                                    >
                                                        <strong>
                                                            {
                                                                reservation.employe
                                                            }
                                                        </strong>

                                                        <span>
                                                            Du{" "}
                                                            {formaterDate(
                                                                reservation.dateDebut
                                                            )}{" "}
                                                            au{" "}
                                                            {formaterDate(
                                                                reservation.dateFin
                                                            )}
                                                        </span>

                                                        <small>
                                                            {
                                                                reservation.statut
                                                            }
                                                        </small>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </section>

                                <section>
                                    <h3>
                                        Maintenances (
                                        {
                                            historiqueVehicule.maintenances
                                                .length
                                        }
                                        )
                                    </h3>

                                    {historiqueVehicule.maintenances.length ===
                                        0 ? (
                                        <p className="table-note">
                                            Aucune maintenance pour ce véhicule.
                                        </p>
                                    ) : (
                                        <div className="detail-list">
                                            {historiqueVehicule.maintenances.map(
                                                (maintenance) => (
                                                    <div
                                                        className="detail-item"
                                                        key={
                                                            maintenance.idMaintenance
                                                        }
                                                    >
                                                        <strong>
                                                            {
                                                                maintenance.typeIntervention
                                                            }
                                                        </strong>

                                                        <span>
                                                            {formaterDate(
                                                                maintenance.dateMaintenance
                                                            )}{" "}
                                                            ·{" "}
                                                            {Number(
                                                                maintenance.cout
                                                            ).toLocaleString(
                                                                "fr-FR",
                                                                {
                                                                    style: "currency",
                                                                    currency:
                                                                        "EUR"
                                                                }
                                                            )}
                                                        </span>

                                                        <small>
                                                            {
                                                                maintenance.statut
                                                            }
                                                        </small>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </section>

                                <section>
                                    <h3>
                                        Incidents (
                                        {
                                            historiqueVehicule.incidents
                                                .length
                                        }
                                        )
                                    </h3>

                                    {historiqueVehicule.incidents.length ===
                                        0 ? (
                                        <p className="table-note">
                                            Aucun incident pour ce véhicule.
                                        </p>
                                    ) : (
                                        <div className="detail-list">
                                            {historiqueVehicule.incidents.map(
                                                (incident) => (
                                                    <div
                                                        className="detail-item"
                                                        key={incident.id}
                                                    >
                                                        <strong>
                                                            {
                                                                incident.typeIncident
                                                            }
                                                        </strong>

                                                        <span>
                                                            {formaterDate(
                                                                incident.dateIncident
                                                            )}{" "}
                                                            · Gravité :{" "}
                                                            {
                                                                incident.gravite
                                                            }
                                                        </span>

                                                        <small>
                                                            {incident.statut}
                                                        </small>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}