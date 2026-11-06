export default function Topbar() {
    return (
        <header className="topbar">
            <button className="icon-btn">☰</button>

            <div className="topbar-right">
                <button className="icon-btn">🔔</button>
                <div className="profile-box">
                    <div className="avatar">M</div>
                    <div>
                        <strong>Mbathie Mayoro</strong>
                        <small>Administrateur</small>
                    </div>
                </div>
            </div>
        </header>
    );
}
