import { createContext, useContext, useEffect, useState } from "react";
import Notification from "../components/Notification";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null);

    const afficherNotification = (message, type = "success") => {
        setNotification({
            message,
            type
        });
    };

    const fermerNotification = () => {
        setNotification(null);
    };

    useEffect(() => {
        if (!notification) {
            return;
        }

        const timer = setTimeout(() => {
            fermerNotification();
        }, 3500);

        return () => clearTimeout(timer);
    }, [notification]);

    return (
        <NotificationContext.Provider value={{ afficherNotification }}>
            {children}

            <Notification
                notification={notification}
                fermer={fermerNotification}
            />
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const contexte = useContext(NotificationContext);

    if (!contexte) {
        throw new Error(
            "useNotification doit être utilisé dans NotificationProvider."
        );
    }

    return contexte;
}