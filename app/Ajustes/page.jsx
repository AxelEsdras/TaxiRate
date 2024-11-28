"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext"; // Importamos el contexto de idioma
import styles from "./ajustes.module.css";

// Traducciones
const translations = {
  es: {
    title: "CONFIGURACIONES",
    label: "Seleccionar Idioma:",
    backButton: "Atrás",
  },
  en: {
    title: "SETTINGS",
    label: "Select Language:",
    backButton: "Back",
  },
};

export default function Configuracion() {
  const { changeLanguage, language } = useLanguage(); // Obtener funciones y estado del contexto
  const router = useRouter(); // Hook para manejar navegación

  // Traducciones actuales
  const t = translations[language];

  const handleChangeLanguage = (event) => {
    changeLanguage(event.target.value); // Cambia el idioma
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back(); // Regresa a la página anterior si existe historial
    } else {
      // Redirige según el rol del usuario si no hay historial
      const role = localStorage.getItem("userRole"); // Ejemplo: obtener el rol desde localStorage
      if (role === "admin") {
        router.push("/Admin");
      } else {
        router.push("/UserHome");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h1 className={styles.title}>{t.title}</h1>
        <label className={styles.label}>
          {t.label}
          <select
            value={language}
            onChange={handleChangeLanguage}
            className={styles.select}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </label>
        <button onClick={handleBack} className={styles.backButton}>
          {t.backButton}
        </button>
      </div>
    </div>
  );
}
