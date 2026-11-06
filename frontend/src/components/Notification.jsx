export default function Notification({ notification, fermer }) {
    if (!notification) {
        return null;
    }

    return (
        <div
            className={`notification notification-${notification.type}`}
            role="alert"
        >
            <span className="notification-icon">
                {notification.type === "success" ? "✓" : "!"}
            </span>

            <span className="notification-message">
                {notification.message}
            </span>

            <button
                type="button"
                className="notification-close"
                onClick={fermer}
                title="Fermer"
            >
                ×
            </button>
        </div>
    );
}
