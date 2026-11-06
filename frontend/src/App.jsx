import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";

import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import VehiculesPage from "./pages/VehiculesPage";
import ReservationsPage from "./pages/ReservationsPage";
import MaintenancePage from "./pages/MaintenancePage";
import IncidentsPage from "./pages/IncidentsPage";
import UtilisateursPage from "./pages/UtilisateursPage";

function App() {
    return (
        <NotificationProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LoginPage />} />

                    <Route element={<MainLayout />}>
                        <Route
                            path="/dashboard"
                            element={<DashboardPage />}
                        />

                        <Route
                            path="/vehicules"
                            element={<VehiculesPage />}
                        />

                        <Route
                            path="/reservations"
                            element={<ReservationsPage />}
                        />

                        <Route
                            path="/maintenance"
                            element={<MaintenancePage />}
                        />

                        <Route
                            path="/incidents"
                            element={<IncidentsPage />}
                        />

                        <Route
                            path="/utilisateurs"
                            element={<UtilisateursPage />}
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </NotificationProvider>
    );
}

export default App;