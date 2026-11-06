import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [motDePasse, setMotDePasse] = useState("");
    const [erreur, setErreur] = useState("");
    const [chargement, setChargement] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErreur("");
        setChargement(true);

        try {
            const response = await fetch(
                "http://localhost:5236/api/Auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        motDePasse: motDePasse
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setErreur(
                    data.message || "Email ou mot de passe incorrect."
                );
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "utilisateur",
                JSON.stringify(data.utilisateur)
            );

            navigate("/dashboard");
        } catch {
            setErreur(
                "Impossible de contacter l’API. Vérifie que le backend est démarré."
            );
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-visual">
                <div className="login-overlay">
                    <h1>GestionParcAuto</h1>
                    <p>Gérez votre parc automobile en toute simplicité</p>
                </div>
            </div>

            <div className="login-panel">
                <div className="login-card">
                    <h2>Connexion</h2>
                    <p>Connectez-vous à votre compte</p>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <label htmlFor="login-email">Email</label>

                        <input
                            id="login-email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />

                        <label htmlFor="login-mot-de-passe">
                            Mot de passe
                        </label>

                        <input
                            id="login-mot-de-passe"
                            type="password"
                            placeholder="Mot de passe"
                            value={motDePasse}
                            onChange={(event) =>
                                setMotDePasse(event.target.value)
                            }
                            required
                        />

                        {erreur && (
                            <p className="login-error">{erreur}</p>
                        )}

                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={chargement}
                        >
                            {chargement
                                ? "Connexion..."
                                : "Se connecter"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}