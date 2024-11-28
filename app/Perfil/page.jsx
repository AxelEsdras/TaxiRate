"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import styles from "./perfil.module.css";
import Image from "next/image";
import { AiOutlineArrowLeft, AiOutlineSetting, AiOutlineUser, AiOutlineEdit, AiOutlineQuestionCircle } from "react-icons/ai";
import { useLanguage } from "../context/LanguageContext";

// Traducciones
const translations = {
  es: {
    nameLabel: "Nombre",
    emailLabel: "Correo electrónico",
    changeNameButton: "Cambiar nombre",
    changePasswordButton: "Cambiar contraseña",
    changePasswordSuccess: "Se envió el enlace para cambiar la contraseña a tu correo",
    logoutTitle: "Cerrar sesión",
    settingsTitle: "Ajustes",
    helpTitle: "Ayuda",
    profileTitle: "Perfil",
  },
  en: {
    nameLabel: "Name",
    emailLabel: "Email",
    changeNameButton: "Change name",
    changePasswordButton: "Change password",
    changePasswordSuccess: "Password change link sent to your email",
    logoutTitle: "Log Out",
    settingsTitle: "Settings",
    helpTitle: "Help",
    profileTitle: "Profile",
  },
};

export default function Perfil() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const [userName, setUserName] = useState("Usuario Anónimo");
  const [email, setEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setEmail(user.email);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || "Usuario Anónimo");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleNameChange = () => {
    if (newName) {
      setUserName(newName);
      setNewName("");
      setIsEditing(false);
      alert("Nombre actualizado");
    }
  };

  const handlePasswordReset = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await auth.sendPasswordResetEmail(user.email);
        setPasswordResetSent(true);
      }
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert("Hubo un error al enviar el enlace de cambio de contraseña.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image src="/logo.jpg" alt="Logo Rate Taxi" width={100} height={100} />
          <span className={styles.pageTitle}>TAXI RATE</span>
        </div>
        <div className={styles.buttonContainer}>
        <button className={styles.navButton} onClick={handleBack}>
            <AiOutlineArrowLeft size={40} title={t.logoutTitle} />
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

      <div className={styles.profileContainer}>
        <div className={styles.profileIcon}>
          <AiOutlineUser size={100} color="#fff" />
        </div>

        <div className={styles.userInfo}>
          <div className={styles.nameContainer}>
            <label>{t.nameLabel}:</label>
            <div className={styles.nameField}>
              {isEditing ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={userName}
                  className={styles.nameInput}
                />
              ) : (
                <span>{userName}</span>
              )}
              <AiOutlineEdit
                className={styles.editIcon}
                size={20}
                onClick={() => setIsEditing(!isEditing)}
              />
            </div>
          </div>

          <div className={styles.emailContainer}>
            <label>{t.emailLabel}:</label>
            <span>{email}</span>
          </div>
        </div>

        <div className={styles.editName}>
          {isEditing && (
            <button className={styles.actionButton} onClick={handleNameChange}>
              {t.changeNameButton}
            </button>
          )}
        </div>

        <div className={styles.changePassword}>
          <button className={styles.actionButton} onClick={handlePasswordReset}>
            {t.changePasswordButton}
          </button>
          {passwordResetSent && <p className={styles.successMessage}>{t.changePasswordSuccess}</p>}
        </div>
      </div>
    </div>
  );
}
