"use client";

import React from "react";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useLanguage } from "./context/LanguageContext"; // Importar contexto de idioma

// Traducciones
const translations = {
  es: {
    home: "INICIO",
    login: "INICIAR SESIÓN",
    signUp: "REGISTRARSE",
    taglineLine1: "Tu experiencia,",
    taglineLine2: "es nuestra ruta hacia un mejor servicio.",
    taglineHighlight: "CONOCE Y EVALÚA",
    taglineEnd: "A NUESTROS CONDUCTORES",
  },
  en: {
    home: "HOME",
    login: "LOG IN",
    signUp: "SIGN UP",
    taglineLine1: "Your experience,",
    taglineLine2: "is our route to better service.",
    taglineHighlight: "MEET AND RATE",
    taglineEnd: "OUR DRIVERS",
  },
};

export default function Home() {
  const { language } = useLanguage(); // Obtener idioma actual
  const t = translations[language]; // Traducciones dinámicas

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image
            src="/logo.jpg"
            alt="Logo Rate Taxi"
            width={100}
            height={100}
            className={styles.logoImage}
          />
          <span className={styles.pageTitle}>TAXI RATE</span>
        </div>
        <ul className={styles.nav}>
          <li>
            <Link href="/" className={`${styles.navItem} ${styles.active}`}>
              {t.home}
            </Link>
          </li>
          <li>
            <Link href="/Login" className={styles.navItem}>
              {t.login}
            </Link>
          </li>
          <li>
            <Link href="/SignUp" className={styles.navItem}>
              {t.signUp}
            </Link>
          </li>
        </ul>
      </header>
      <section id="hero" className={styles.hero}>
        <h2>{t.taglineLine1}</h2>
        <h2>{t.taglineLine2}</h2>
        <h1>
          <span className={styles.highlight}>{t.taglineHighlight}</span> {t.taglineEnd}
        </h1>
      </section>
    </div>
  );
}
