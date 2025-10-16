// src/pages/HomePage/components/Header.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { signOutUser } from "../../../services/authService";
import styles from '../HomePage.module.css';

export const Header = () => {
  const { currentUser } = useAuth();
  const handleLogout = async () => { await signOutUser(); };

  return (
    <header className={styles.header}>
      <div className={styles.headerWelcome}>
        <h2>Hola, {currentUser?.displayName?.split(' ')[0]}</h2>
      </div>
      <div className={styles.headerActions}>
        <Link to="/inventory" className={styles.settingsLink}>
          Inventario
        </Link>
        <Link to="/settings" className={styles.settingsLink}>
          Configuración ⚙️
        </Link>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Salir
        </button>
      </div>
    </header>
  );
};