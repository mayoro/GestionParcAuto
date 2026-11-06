import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5236/api/Utilisateur";

export default function UtilisateursPage() {
    const navigate = useNavigate();

    const [utilisateurs, setUtilisateurs] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    const [recherche, setRecherche] = useState("");
    const [roleFiltre, setRoleFiltre] = useState("");

    const [afficherFormulaire, setAfficherFormulaire] = useState(false);
    const [ajoutEnCours, setAjoutEnCours] = useState(false);
    const [erreurFormulaire, setErreurFormulaire] = useState("");

    const [nouvelUtilisateur, setNouvelUtilisateur] = useState({
        nomComplet: "",
        email: "",
        motDePasse: "",
        role: "Employé",
        estActif: true
    });

    const [utilisateurEnModification, setUtilisateurEnModification] = useState(null);
    const [modificationEnCours, setModificationEnCours] = useState(false);
    const [erreurModification, setErreurModification] = useState("");

    const getToken = () => localStorage.getItem("token");

    const deconnecter = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("utilisateur");
        navigate("/");
    };

    const chargerUtilisateurs = async () => {
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

            const data = await response.json();

            if (!response.ok) {
                setErreur(data.message || "Impossible de charger les utilisateurs.");
                return;
            }

            setUtilisateurs(data);
        } catch {
            setErreur("Impossible de contacter l’API. Vérifie que le backend est démarré.");
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        chargerUtilisateurs();
    }, []);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setNouvelUtilisateur((ancienUtilisateur) => ({
            ...ancienUtilisateur,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const ouvrirFormulaire = () => {
        setErreurFormulaire("");
        setNouvelUtilisateur({
            nomComplet: "",
            email: "",
            motDePasse: "",
            role: "Employé",
            estActif: true
        });
        setAfficherFormulaire(true);
    };

    const fermerFormulaire = () => {
        if (!ajoutEnCours) {
            setAfficherFormulaire(false);
            setErreurFormulaire("");
        }
    };

    const ajouterUtilisateur = async (event) => {
        event.preventDefault();
        setErreurFormulaire("");
        setAjoutEnCours(true);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify(nouvelUtilisateur)
            });

            if (response.status === 401 || response.status === 403) {
                deconnecter();
                return;
            }

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                setErreurFormulaire(
                    data?.message || "Impossible d’ajouter cet utilisateur."
                );
                return;
            }

            setAfficherFormulaire(false);
            await chargerUtilisateurs();
        } catch {
            setErreurFormulaire(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setAjoutEnCours(false);
        }
    };

    const supprimerUtilisateur = async (utilisateur) => {
        const confirmation = window.confirm(
            `Voulez-vous vraiment supprimer l'utilisateur "${utilisateur.nomComplet}" ?`
        );

        if (!confirmation) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${utilisateur.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                deconnecter();
                return;
            }

            if (!response.ok) {
                let data = null;

                try {
                    data = await response.json();
                } catch {
                    data = null;
                }

                setErreur(
                    data?.message || "Impossible de supprimer cet utilisateur."
                );
                return;
            }

            await chargerUtilisateurs();
        } catch {
            setErreur(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        }
    };

    const ouvrirModification = (utilisateur) => {
        setErreurModification("");

        setUtilisateurEnModification({
            id: utilisateur.id,
            nomComplet: utilisateur.nomComplet || "",
            email: utilisateur.email || "",
            role: utilisateur.role || "Employé",
            estActif: utilisateur.estActif
        });
    };

    const fermerModification = () => {
        if (!modificationEnCours) {
            setUtilisateurEnModification(null);
            setErreurModification("");
        }
    };

    const handleModificationChange = (event) => {
        const { name, value, type, checked } = event.target;

        setUtilisateurEnModification((ancienUtilisateur) => ({
            ...ancienUtilisateur,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const modifierUtilisateur = async (event) => {
        event.preventDefault();
        setErreurModification("");
        setModificationEnCours(true);

        try {
            const response = await fetch(
                `${API_URL}/${utilisateurEnModification.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(utilisateurEnModification)
                }
            );

            if (response.status === 401 || response.status === 403) {
                deconnecter();
                return;
            }

            if (!response.ok) {
                let data = null;

                try {
                    data = await response.json();
                } catch {
                    data = null;
                }

                setErreurModification(
                    data?.message || "Impossible de modifier cet utilisateur."
                );
                return;
            }

            setUtilisateurEnModification(null);
            await chargerUtilisateurs();
        } catch {
            setErreurModification(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setModificationEnCours(false);
        }
    };


    const getRoleClass = (role) => {
        switch (role) {
            case "Administrateur":
                return "user-role admin";
            case "Employé":
                return "user-role employee";
            case "Technicien":
                return "user-role technician";
            default:
                return "user-role pending";
        }
    };

    const getStatusClass = (estActif) => {
        return estActif ? "user-status active" : "user-status inactive";
    };

    const utilisateursFiltres = utilisateurs.filter((utilisateur) => {
        const nom = utilisateur.nomComplet || "";
        const email = utilisateur.email || "";
        const role = utilisateur.role || "";

        const correspondRecherche =
            nom.toLowerCase().includes(recherche.toLowerCase()) ||
            email.toLowerCase().includes(recherche.toLowerCase());

        const correspondRole =
            roleFiltre === "" || role === roleFiltre;

        return correspondRecherche && correspondRole;
    });

    return (
        <div className="utilisateurs-page">
            <div className="utilisateurs-header">
                <h1>Utilisateurs</h1>

                <button className="add-user-btn" onClick={ouvrirFormulaire}>
                    + Ajouter un utilisateur
                </button>
            </div>

            <div className="utilisateurs-toolbar">
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
                        value={roleFiltre}
                        onChange={(event) => setRoleFiltre(event.target.value)}
                    >
                        <option value="">Tous les rôles</option>
                        <option value="Administrateur">Administrateur</option>
                        <option value="Employé">Employé</option>
                        <option value="Technicien">Technicien</option>
                    </select>
                </div>
            </div>

            {afficherFormulaire && (
                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "12px",
                        padding: "24px",
                        marginBottom: "24px",
                        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.12)"
                    }}
                >
                    <h2 style={{ marginTop: 0 }}>Ajouter un utilisateur</h2>

                    <form onSubmit={ajouterUtilisateur}>
                        <div style={{ display: "grid", gap: "12px" }}>
                            <input
                                type="text"
                                name="nomComplet"
                                placeholder="Nom complet"
                                value={nouvelUtilisateur.nomComplet}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={nouvelUtilisateur.email}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="password"
                                name="motDePasse"
                                placeholder="Mot de passe"
                                value={nouvelUtilisateur.motDePasse}
                                onChange={handleChange}
                                required
                            />

                            <select
                                name="role"
                                value={nouvelUtilisateur.role}
                                onChange={handleChange}
                            >
                                <option value="Employé">Employé</option>
                                <option value="Technicien">Technicien</option>
                                <option value="Administrateur">
                                    Administrateur
                                </option>
                            </select>

                            <label style={{ display: "flex", gap: "8px" }}>
                                <input
                                    type="checkbox"
                                    name="estActif"
                                    checked={nouvelUtilisateur.estActif}
                                    onChange={handleChange}
                                />
                                Compte actif
                            </label>

                            {erreurFormulaire && (
                                <p className="login-error">
                                    {erreurFormulaire}
                                </p>
                            )}

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    type="submit"
                                    className="add-user-btn"
                                    disabled={ajoutEnCours}
                                >
                                    {ajoutEnCours
                                        ? "Ajout en cours..."
                                        : "Enregistrer"}
                                </button>

                                <button
                                    type="button"
                                    onClick={fermerFormulaire}
                                    disabled={ajoutEnCours}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {utilisateurEnModification && (
                <div className="utilisateur-form-card">
                    <div className="utilisateur-form-header">
                        <h2>Modifier un utilisateur</h2>

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

                    <form className="utilisateur-form" onSubmit={modifierUtilisateur}>
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Nom complet</label>
                                <input
                                    type="text"
                                    name="nomComplet"
                                    value={utilisateurEnModification.nomComplet}
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={utilisateurEnModification.email}
                                    onChange={handleModificationChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Rôle</label>
                                <select
                                    name="role"
                                    value={utilisateurEnModification.role}
                                    onChange={handleModificationChange}
                                >
                                    <option value="Employé">Employé</option>
                                    <option value="Technicien">Technicien</option>
                                    <option value="Administrateur">Administrateur</option>
                                </select>
                            </div>

                            <div className="form-field form-checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="estActif"
                                        checked={utilisateurEnModification.estActif}
                                        onChange={handleModificationChange}
                                    />
                                    Compte actif
                                </label>
                            </div>
                        </div>

                        {erreurModification && (
                            <p className="login-error">{erreurModification}</p>
                        )}

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="add-user-btn"
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


            <div className="utilisateurs-table-card">
                {chargement && (
                    <p className="table-note">
                        Chargement des utilisateurs...
                    </p>
                )}

                {erreur && <p className="login-error">{erreur}</p>}

                {!chargement && !erreur && (
                    <div className="table-wrapper">
                        <table className="utilisateurs-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Rôle</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {utilisateursFiltres.length === 0 ? (
                                    <tr>
                                        <td colSpan="5">
                                            Aucun utilisateur trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    utilisateursFiltres.map((utilisateur) => (
                                        <tr key={utilisateur.id}>
                                            <td>{utilisateur.nomComplet}</td>
                                            <td>{utilisateur.email}</td>
                                            <td>
                                                <span
                                                    className={getRoleClass(
                                                        utilisateur.role
                                                    )}
                                                >
                                                    {utilisateur.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        utilisateur.estActif
                                                    )}
                                                >
                                                    {utilisateur.estActif
                                                        ? "Actif"
                                                        : "Inactif"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="user-actions">
                                                    <button title="Voir">👁️</button>
                                                    <button
                                                        title="Modifier"
                                                        onClick={() => ouvrirModification(utilisateur)}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        title="Supprimer"
                                                        onClick={() => supprimerUtilisateur(utilisateur)}
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

                <div className="utilisateurs-footer">
                    <p className="table-note">
                        {utilisateurs.length} utilisateur(s) chargé(s) depuis
                        l’API.
                    </p>
                </div>
            </div>
        </div>
    );
}