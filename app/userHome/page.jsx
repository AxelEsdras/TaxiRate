"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AiOutlineLogout, AiOutlineUser, AiOutlineSetting, AiOutlineQuestionCircle } from "react-icons/ai";
import { FaStar, FaChartBar, FaHistory } from "react-icons/fa"; // Nuevos íconos
import styles from "./userHome.module.css";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

const translations = {
  es: {
    pageTitle: "TAXI RATE",
    rate: "Calificar",
    bookmarks: "Marcadores",
    taxist: "Taxistas",
    history: "Historial",
    logoutTitle: "Cerrar sesión",
    settingsTitle: "Ajustes",
    profileTitle: "Perfil",
    helpTitle: "Ayuda",
  },
  en: {
    pageTitle: "TAXI RATE",
    rate: "Rate",
    bookmarks: "Bookmarks",
    history: "History",
    taxist: "Drivers",
    logoutTitle: "Log Out",
    settingsTitle: "Settings",
    profileTitle: "Profile",
    helpTitle: "Help",
  },
};

export default function UserHome() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image src="/logo.jpg" alt="Logo Rate Taxi" width={100} height={100} />
          <span className={styles.pageTitle}>{t.pageTitle}</span>
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={handleLogout} className={styles.navButton}>
            <AiOutlineLogout size={40} title={t.logoutTitle} />
          </button>
          <button className={styles.navButton} onClick={() => router.push("/Ajustes")}>
            <AiOutlineSetting size={40} title={t.settingsTitle} />
            </button>
            <button className={styles.navButton} onClick={() => router.push("/Perfil")}>
            <AiOutlineUser size={40} title={t.profileTitle} />
            </button>
            <button className={styles.navButton} onClick={() => router.push("/Help")}>
            <AiOutlineQuestionCircle size={40} title={t.helpTitle} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.buttonGrid}>
        <Link href="/Taxistas" className={styles.actionButton}>
            <AiOutlineUser size={40} /> {/* Ícono para "Calificar" */}
            <span>{t.taxist}</span>
          </Link>
          <Link href="/rate" className={styles.actionButton}>
            <FaStar size={40} /> {/* Ícono para "Calificar" */}
            <span>{t.rate}</span>
          </Link>
          <Link href="/Marcadores" className={styles.actionButton}>
            <FaChartBar size={40} /> {/* Ícono para "Marcadores" */}
            <span>{t.bookmarks}</span>
          </Link>
          <Link href="/Historial" className={styles.actionButton}>
            <FaHistory size={40} /> {/* Ícono para "Historial" */}
            <span>{t.history}</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
