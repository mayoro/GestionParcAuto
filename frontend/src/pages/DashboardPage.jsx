import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_VEHICULES = "http://localhost:5236/api/Vehicule";
const API_RESERVATIONS = "http://localhost:5236/api/Reservation";
const API_MAINTENANCES = "http://localhost:5236/api/Maintenance";
const API_INCIDENTS = "http://localhost:5236/api/Incident";

export default function DashboardPage() {
    const navigate = useNavigate();

    const [vehicules, setVehicules] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [incidents, setIncidents] = useState([]);

    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

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
                reponseVehicules,
                reponseReservations,
                reponseMaintenances,
                reponseIncidents
            ] = await Promise.all([
                fetch(API_VEHICULES, { headers }),
                fetch(API_RESERVATIONS, { headers }),
                fetch(API_MAINTENANCES, { headers }),
                fetch(API_INCIDENTS, { headers })
            ]);

            if (
                estNonAutorise(reponseVehicules) ||
                estNonAutorise(reponseReservations) ||
                estNonAutorise(reponseMaintenances) ||
                estNonAutorise(reponseIncidents)
            ) {
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

            if (!reponseReservations.ok) {
                setErreur(
                    await lireReponseErreur(
                        reponseReservations,
                        "Impossible de charger les réservations."
                    )
                );
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

            if (!reponseIncidents.ok) {
                setErreur(
                    await lireReponseErreur(
                        reponseIncidents,
                        "Impossible de charger les incidents."
                    )
                );
                return;
            }

            setVehicules(await reponseVehicules.json());
            setReservations(await reponseReservations.json());
            setMaintenances(await reponseMaintenances.json());
            setIncidents(await reponseIncidents.json());
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

    const getStatusClass = (statut) => {
        switch (statut) {
            case "Confirmée":
                return "status-badge confirmed";
            case "En cours":
                return "status-badge progress";
            case "Terminée":
                return "status-badge completed";
            case "Annulée":
                return "status-badge canceled";
            default:
                return "status-badge pending";
        }
    };

    const reservationsActives = reservations.filter(
        (reservation) =>
            reservation.statut === "Confirmée" ||
            reservation.statut === "En cours"
    );

    const maintenancesEnCours = maintenances.filter(
        (maintenance) => maintenance.statut === "En cours"
    );

    const incidentsActifs = incidents.filter(
        (incident) =>
            incident.statut === "Ouvert" ||
            incident.statut === "En cours"
    );

    const incidentsFaibles = incidents.filter(
        (incident) => incident.gravite === "Faible"
    ).length;

    const incidentsMoyens = incidents.filter(
        (incident) => incident.gravite === "Moyenne"
    ).length;

    const incidentsEleves = incidents.filter(
        (incident) => incident.gravite === "Élevée"
    ).length;

    const totalIncidents =
        incidentsFaibles + incidentsMoyens + incidentsEleves;

    const angleFaible =
        totalIncidents === 0
            ? 0
            : (incidentsFaibles / totalIncidents) * 360;

    const angleMoyenne =
        totalIncidents === 0
            ? 0
            : angleFaible + (incidentsMoyens / totalIncidents) * 360;

    const graphiqueIncidents =
        totalIncidents === 0
            ? {
                background:
                    "conic-gradient(#e5e7eb 0deg 360deg)"
            }
            : {
                background: `conic-gradient(
                      #22c55e 0deg ${angleFaible}deg,
                      #f59e0b ${angleFaible}deg ${angleMoyenne}deg,
                      #ef4444 ${angleMoyenne}deg 360deg
                  )`
            };

    const stats = [
        {
            title: "Véhicules",
            value: vehicules.length,
            subtitle: `${vehicules.filter(
                (vehicule) => vehicule.statut === "Disponible"
            ).length} disponible(s)`,
            icon: "🚘",
            colorClass: "blue"
        },
        {
            title: "Réservations",
            value: reservationsActives.length,
            subtitle: "Réservation(s) active(s)",
            icon: "📅",
            colorClass: "green"
        },
        {
            title: "En maintenance",
            value: maintenancesEnCours.length,
            subtitle: "Intervention(s) en cours",
            icon: "🛠️",
            colorClass: "orange"
        },
        {
            title: "Incidents",
            value: incidentsActifs.length,
            subtitle: "Incident(s) non résolu(s)",
            icon: "⚠️",
            colorClass: "red"
        }
    ];

    const reservationsRecentes = [...reservations]
        .sort(
            (a, b) =>
                new Date(b.dateDebut).getTime() -
                new Date(a.dateDebut).getTime()
        )
        .slice(0, 4);

    const incidentsParGravite = [
        {
            label: "Faible",
            value: incidentsFaibles,
            color: "#22c55e"
        },
        {
            label: "Moyenne",
            value: incidentsMoyens,
            color: "#f59e0b"
        },
        {
            label: "Élevée",
            value: incidentsEleves,
            color: "#ef4444"
        }
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Vue d’ensemble actualisée depuis l’API.</p>
            </div>

            {chargement && (
                <p className="table-note">
                    Chargement des statistiques...
                </p>
            )}

            {erreur && <p className="login-error">{erreur}</p>}

            {!chargement && !erreur && (
                <>
                    <div className="stats-grid">
                        {stats.map((item) => (
                            <div className="stat-card" key={item.title}>
                                <div className={`stat-icon ${item.colorClass}`}>
                                    <span>{item.icon}</span>
                                </div>

                                <div className="stat-info">
                                    <h4>{item.title}</h4>
                                    <h2>{item.value}</h2>
                                    <p>{item.subtitle}</p>
                                    <span className="card-note">
                                        Données API
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="dashboard-bottom">
                        <div className="dashboard-panel reservations-panel">
                            <div className="panel-header">
                                <h3>Réservations récentes</h3>

                                <button
                                    type="button"
                                    className="link-btn"
                                    onClick={() => navigate("/reservations")}
                                >
                                    Voir tout
                                </button>
                            </div>

                            <div className="table-wrapper">
                                <table className="reservations-table">
                                    <thead>
                                        <tr>
                                            <th>Véhicule</th>
                                            <th>Employé</th>
                                            <th>Date début</th>
                                            <th>Date fin</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {reservationsRecentes.length === 0 ? (
                                            <tr>
                                                <td colSpan="5">
                                                    Aucune réservation.
                                                </td>
                                            </tr>
                                        ) : (
                                            reservationsRecentes.map(
                                                (reservation) => (
                                                    <tr
                                                        key={
                                                            reservation.idReservation
                                                        }
                                                    >
                                                        <td>
                                                            {
                                                                reservation.vehicule
                                                            }
                                                        </td>
                                                        <td>
                                                            {
                                                                reservation.employe
                                                            }
                                                        </td>
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
                                                                {
                                                                    reservation.statut
                                                                }
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="dashboard-panel incidents-panel">
                            <div className="panel-header">
                                <h3>Incidents par gravité</h3>
                            </div>

                            <div className="incident-chart-box">
                                <div
                                    className="fake-donut-chart"
                                    style={graphiqueIncidents}
                                ></div>

                                <div className="incident-legend">
                                    {incidentsParGravite.map((item) => (
                                        <div
                                            className="legend-item"
                                            key={item.label}
                                        >
                                            <span
                                                className="legend-dot"
                                                style={{
                                                    backgroundColor: item.color
                                                }}
                                            ></span>

                                            <span>
                                                {item.label} ({item.value})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="panel-placeholder-text">
                                {totalIncidents} incident(s) enregistré(s).
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}