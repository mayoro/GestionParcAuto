import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
    const navigate = useNavigate();

    const getNavClass = ({ isActive }) =>
        isActive ? "menu-link active" : "menu-link";

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <aside className="sidebar">
            <div>
                <div className="logo-box">
                    <div className="logo-mark">G</div>
                    <div>
                        <h3>GestionParcAuto</h3>
                        <p>Administration</p>
                    </div>
                </div>

                <nav className="menu">
                    <NavLink to="/dashboard" className={getNavClass}>
                        Dashboard
                    </NavLink>

                    <NavLink to="/vehicules" className={getNavClass}>
                        Véhicules
                    </NavLink>

                    <NavLink to="/reservations" className={getNavClass}>
                        Réservations
                    </NavLink>

                    <NavLink to="/maintenance" className={getNavClass}>
                        Maintenance
                    </NavLink>

                    <NavLink to="/incidents" className={getNavClass}>
                        Incidents
                    </NavLink>

                    <NavLink to="/utilisateurs" className={getNavClass}>
                        Utilisateurs
                    </NavLink>
                </nav>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
                Déconnexion
            </button>
        </aside>
    );
}