import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

const API_RESERVATIONS = "http://localhost:5236/api/Reservation";
const API_VEHICULES = "http://localhost:5236/api/Vehicule";
const API_UTILISATEURS = "http://localhost:5236/api/Utilisateur";

const reservationVide = {
    dateDebut: "",
    dateFin: "",
    idUtilisateur: "",
    idVehicule: "",
    statut: "Confirmée"
};

export default function ReservationsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { afficherNotification } = useNotification();

    const vehiculeIdDansUrl = Number(searchParams.get("vehicule"));

    const [reservations, setReservations] = useState([]);
    const [vehicules, setVehicules] = useState([]);
    const [utilisateurs, setUtilisateurs] = useState([]);

    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    const [recherche, setRecherche] = useState("");
    const [statutFiltre, setStatutFiltre] = useState("");
    const [periodeFiltre, setPeriodeFiltre] = useState("");

    const [afficherFormulaireAjout, setAfficherFormulaireAjout] =
        useState(false);
    const [nouvelleReservation, setNouvelleReservation] =
        useState(reservationVide);
    const [ajoutEnCours, setAjoutEnCours] = useState(false);
    const [erreurAjout, setErreurAjout] = useState("");

    const [reservationEnModification, setReservationEnModification] =
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

    const verifierAuthentification = (response) => {
        if (response.status === 401 || response.status === 403) {
            deconnecter();
            return true;
        }

        return false;
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

            const [
                reponseReservations,
                reponseVehicules,
                reponseUtilisateurs
            ] = await Promise.all([
                fetch(API_RESERVATIONS, { headers }),
                fetch(API_VEHICULES, { headers }),
                fetch(API_UTILISATEURS, { headers })
            ]);

            if (
                verifierAuthentification(reponseReservations) ||
                verifierAuthentification(reponseVehicules) ||
                verifierAuthentification(reponseUtilisateurs)
            ) {
                return;
            }

            if (!reponseReservations.ok) {
                setErreur(
                    await lireReponseErreur(
                        reponseReservations,
                        "Impossible de charger les réservations."
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

            if (!reponseUtilisateurs.ok) {
                setErreur(
                    await lireReponseErreur(
                        reponseUtilisateurs,
                        "Impossible de charger les utilisateurs."
                    )
                );
                return;
            }

            const donneesReservations = await reponseReservations.json();
            const donneesVehicules = await reponseVehicules.json();
            const donneesUtilisateurs = await reponseUtilisateurs.json();

            setReservations(donneesReservations);
            setVehicules(donneesVehicules);
            setUtilisateurs(donneesUtilisateurs);
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

        setNouvelleReservation({
            ...reservationVide,
            idVehicule: vehiculeIdDansUrl
        });

        setErreurAjout("");
        setAfficherFormulaireAjout(true);
    }, [vehiculeIdDansUrl]);

    const getStatusClass = (statut) => {
        switch (statut) {
            case "Confirmée":
                return "reservation-status confirmed";
            case "En cours":
                return "reservation-status progress";
            case "Terminée":
                return "reservation-status completed";
            case "Annulée":
                return "reservation-status canceled";
            default:
                return "reservation-status pending";
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

    const getIdUtilisateur = (utilisateur) =>
        utilisateur.idUtilisateur ?? utilisateur.id;

    const getNomUtilisateur = (utilisateur) =>
        utilisateur.nomComplet ??
        utilisateur.nom ??
        utilisateur.email ??
        "Utilisateur sans nom";

    const datesReservationValides = (dateDebut, dateFin) => {
        if (!dateDebut || !dateFin) {
            return false;
        }

        return new Date(dateFin) > new Date(dateDebut);
    };

    const handleAjoutChange = (event) => {
        const { name, value } = event.target;

        setNouvelleReservation((ancienneReservation) => ({
            ...ancienneReservation,
            [name]:
                name === "idUtilisateur" || name === "idVehicule"
                    ? Number(value)
                    : value
        }));
    };

    const ouvrirAjout = () => {
        setNouvelleReservation(reservationVide);
        setErreurAjout("");
        setAfficherFormulaireAjout(true);
    };

    const fermerAjout = () => {
        if (!ajoutEnCours) {
            setAfficherFormulaireAjout(false);
            setErreurAjout("");

            if (vehiculeIdDansUrl > 0) {
                navigate("/reservations");
            }
        }
    };

    const ajouterReservation = async (event) => {
        event.preventDefault();
        setErreurAjout("");

        if (
            !datesReservationValides(
                nouvelleReservation.dateDebut,
                nouvelleReservation.dateFin
            )
        ) {
            setErreurAjout(
                "La date et l’heure de fin doivent être après la date et l’heure de début."
            );
            return;
        }

        setAjoutEnCours(true);

        const donneesCreation = {
            dateDebut: nouvelleReservation.dateDebut,
            dateFin: nouvelleReservation.dateFin,
            idUtilisateur: Number(nouvelleReservation.idUtilisateur),
            idVehicule: Number(nouvelleReservation.idVehicule)
        };

        try {
            const response = await fetch(API_RESERVATIONS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify(donneesCreation)
            });

            if (verifierAuthentification(response)) {
                return;
            }

            if (!response.ok) {
                setErreurAjout(
                    await lireReponseErreur(
                        response,
                        "Impossible d’ajouter cette réservation."
                    )
                );
                return;
            }
            setAfficherFormulaireAjout(false);
            navigate("/reservations");
            afficherNotification("Réservation créée avec succès.");
            await chargerDonnees();
        } catch {
            setErreurAjout(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setAjoutEnCours(false);
        }
    };

    const ouvrirModification = (reservation) => {
        setErreurModification("");

        setReservationEnModification({
            idReservation: reservation.idReservation,
            dateDebut: convertirDatePourInput(reservation.dateDebut),
            dateFin: convertirDatePourInput(reservation.dateFin),
            idUtilisateur: reservation.idUtilisateur,
            idVehicule: reservation.idVehicule,
            statut: reservation.statut
        });
    };

    const fermerModification = () => {
        if (!modificationEnCours) {
            setReservationEnModification(null);
            setErreurModification("");
        }
    };

    const handleModificationChange = (event) => {
        const { name, value } = event.target;

        setReservationEnModification((ancienneReservation) => ({
            ...ancienneReservation,
            [name]:
                name === "idUtilisateur" || name === "idVehicule"
                    ? Number(value)
                    : value
        }));
    };

    const modifierReservation = async (event) => {
        event.preventDefault();
        setErreurModification("");

        if (
            !datesReservationValides(
                reservationEnModification.dateDebut,
                reservationEnModification.dateFin
            )
        ) {
            setErreurModification(
                "La date et l’heure de fin doivent être après la date et l’heure de début."
            );
            return;
        }

        setModificationEnCours(true);

        try {
            const response = await fetch(
                `${API_RESERVATIONS}/${reservationEnModification.idReservation}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(reservationEnModification)
                }
            );

            if (verifierAuthentification(response)) {
                return;
            }

            if (!response.ok) {
                setErreurModification(
                    await lireReponseErreur(
                        response,
                        "Impossible de modifier cette réservation."
                    )
                );
                return;
            }

            setReservationEnModification(null);
            await chargerDonnees();
        } catch {
            setErreurModification(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setModificationEnCours(false);
        }
    };

    const supprimerReservation = async (reservation) => {
        const confirmation = window.confirm(
            `Voulez-vous vraiment supprimer la réservation de ${reservation.vehicule} ?`
        );

        if (!confirmation) {
            return;
        }

        setErreur("");

        try {
            const response = await fetch(
                `${API_RESERVATIONS}/${reservation.idReservation}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                }
            );

            if (verifierAuthentification(response)) {
                return;
            }

            if (!response.ok) {
                setErreur(
                    await lireReponseErreur(
                        response,
                        "Impossible de supprimer cette réservation."
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

    const estDansPeriode = (reservation) => {
        if (!periodeFiltre) {
            return true;
        }

        const maintenant = new Date();
        const dateReservation = new Date(reservation.dateDebut);

        if (periodeFiltre === "semaine") {
            const debutSemaine = new Date(maintenant);
            debutSemaine.setDate(
                maintenant.getDate() - maintenant.getDay() + 1
            );
            debutSemaine.setHours(0, 0, 0, 0);

            const finSemaine = new Date(debutSemaine);
            finSemaine.setDate(debutSemaine.getDate() + 7);

            return (
                dateReservation >= debutSemaine &&
                dateReservation < finSemaine
            );
        }

        if (periodeFiltre === "mois") {
            return (
                dateReservation.getMonth() === maintenant.getMonth() &&
                dateReservation.getFullYear() === maintenant.getFullYear()
            );
        }

        if (periodeFiltre === "annee") {
            return dateReservation.getFullYear() === maintenant.getFullYear();
        }

        return true;
    };

    const reservationsFiltrees = reservations.filter((reservation) => {
        const texte = recherche.toLowerCase();

        const correspondRecherche =
            (reservation.vehicule || "").toLowerCase().includes(texte) ||
            (reservation.employe || "").toLowerCase().includes(texte);

        const correspondStatut =
            statutFiltre === "" || reservation.statut === statutFiltre;

        return (
            correspondRecherche &&
            correspondStatut &&
            estDansPeriode(reservation)
        );
    });

    const ajoutDatesValides = datesReservationValides(
        nouvelleReservation.dateDebut,
        nouvelleReservation.dateFin
    );

    const modificationDatesValides = reservationEnModification
        ? datesReservationValides(
            reservationEnModification.dateDebut,
            reservationEnModification.dateFin
        )
        : false;

    const ajoutFormulaireValide =
        Number(nouvelleReservation.idUtilisateur) > 0 &&
        Number(nouvelleReservation.idVehicule) > 0 &&
        ajoutDatesValides;

    const modificationFormulaireValide =
        reservationEnModification &&
        Number(reservationEnModification.idUtilisateur) > 0 &&
        Number(reservationEnModification.idVehicule) > 0 &&
        modificationDatesValides;

    return (
        <div className="reservations-page">
            <div className="reservations-header">
                <h1>Réservations</h1>

                <button
                    className="add-reservation-btn"
                    onClick={ouvrirAjout}
                >
                    + Nouvelle réservation
                </button>
            </div>

            <div className="reservations-toolbar">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Rechercher un véhicule ou un employé..."
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
                        <option value="Confirmée">Confirmée</option>
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
                        <h2>Nouvelle réservation</h2>

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
                        onSubmit={ajouterReservation}
                    >
                        <div className="form-grid">
                            <div className="form-field">
                                <label htmlFor="reservation-employe">Employé</label>

                                <select
                                    id="reservation-employe"
                                    name="idUtilisateur"
                                    value={nouvelleReservation.idUtilisateur}
                                    onChange={handleAjoutChange}
                                    required
                                >
                                    <option value="">
                                        Sélectionner un employé
                                    </option>

                                    {utilisateurs.map((utilisateur) => (
                                        <option
                                            key={getIdUtilisateur(utilisateur)}
                                            value={getIdUtilisateur(utilisateur)}
                                        >
                                            {getNomUtilisateur(utilisateur)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label htmlFor="reservation-vehicule">Véhicule</label>

                                <select
                                    id="reservation-vehicule"
                                    name="idVehicule"
                                    value={nouvelleReservation.idVehicule}
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
                                <label htmlFor="reservation-date-debut">
                                    Date et heure de début
                                </label>

                                <input
                                    id="reservation-date-debut"
                                    type="datetime-local"
                                    name="dateDebut"
                                    value={nouvelleReservation.dateDebut}
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="reservation-date-fin">
                                    Date et heure de fin
                                </label>

                                <input
                                    id="reservation-date-fin"
                                    type="datetime-local"
                                    name="dateFin"
                                    value={nouvelleReservation.dateFin}
                                    onChange={handleAjoutChange}
                                    required
                                />
                            </div>
                        </div>

                        {nouvelleReservation.dateDebut &&
                            nouvelleReservation.dateFin &&
                            !ajoutDatesValides && (
                                <p className="login-error">
                                    La date de fin doit être après la date de début.
                                </p>
                            )}

                        {erreurAjout && (
                            <p className="login-error">{erreurAjout}</p>
                        )}

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="add-reservation-btn"
                                disabled={ajoutEnCours || !ajoutFormulaireValide}
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

            {reservationEnModification && (
                <div className="utilisateur-form-card">
                    <div className="utilisateur-form-header">
                        <h2>Modifier une réservation</h2>

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
                        onSubmit={modifierReservation}
                    >
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Employé</label>
                                <select
                                    name="idUtilisateur"
                                    value={
                                        reservationEnModification.idUtilisateur
                                    }
                                    onChange={handleModificationChange}
                                    required
                                >
                                    {utilisateurs.map((utilisateur) => (
                                        <option
                                            key={getIdUtilisateur(utilisateur)}
                                            value={getIdUtilisateur(utilisateur)}
                                        >
                                            {getNomUtilisateur(utilisateur)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Véhicule</label>
                                <select
                                    name="idVehicule"
                                    value={
                                        reservationEnModification.idVehicule
                                    }
                                    onChange={handleModificationChange}
                                    required
                                >
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
                                <label>Date et heure de début</label>
                                <input
                                    type="datetime-local"
                                    name="dateDebut"
                                    value={
                                        reservationEnModification.dateDebut
                                    }
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Date et heure de fin</label>
                                <input
                                    type="datetime-local"
                                    name="dateFin"
                                    value={reservationEnModification.dateFin}
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Statut</label>
                                <select
                                    name="statut"
                                    value={reservationEnModification.statut}
                                    onChange={handleModificationChange}
                                    required
                                >
                                    <option value="Confirmée">
                                        Confirmée
                                    </option>
                                    <option value="En cours">En cours</option>
                                    <option value="Terminée">Terminée</option>
                                    <option value="Annulée">Annulée</option>
                                </select>
                            </div>
                        </div>

                        {reservationEnModification.dateDebut &&
                            reservationEnModification.dateFin &&
                            !modificationDatesValides && (
                                <p className="login-error">
                                    La date de fin doit être après la date de début.
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
                                className="add-reservation-btn"
                                disabled={
                                    modificationEnCours ||
                                    !modificationFormulaireValide
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

            <div className="reservations-table-card">
                {chargement && (
                    <p className="table-note">
                        Chargement des réservations...
                    </p>
                )}

                {erreur && <p className="login-error">{erreur}</p>}

                {!chargement && !erreur && (
                    <div className="table-wrapper">
                        <table className="reservations-list-table">
                            <thead>
                                <tr>
                                    <th>Véhicule</th>
                                    <th>Employé</th>
                                    <th>Date début</th>
                                    <th>Date fin</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {reservationsFiltrees.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            Aucune réservation trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    reservationsFiltrees.map((reservation) => (
                                        <tr key={reservation.idReservation}>
                                            <td>{reservation.vehicule}</td>
                                            <td>{reservation.employe}</td>
                                            <td>
                                                {formaterDate(
                                                    reservation.dateDebut
                                                )}
                                            </td>
                                            <td>
                                                {formaterDate(
                                                    reservation.dateFin
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        reservation.statut
                                                    )}
                                                >
                                                    {reservation.statut}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="reservation-actions">
                                                    <button
                                                        title="Modifier"
                                                        onClick={() =>
                                                            ouvrirModification(
                                                                reservation
                                                            )
                                                        }
                                                    >
                                                        ✏️
                                                    </button>

                                                    <button
                                                        title="Supprimer"
                                                        onClick={() =>
                                                            supprimerReservation(
                                                                reservation
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

                <div className="reservations-footer">
                    <p className="table-note">
                        {reservations.length} réservation(s) chargée(s) depuis
                        l’API.
                    </p>
                </div>
            </div>
        </div>
    );
}
