"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import styles from "./login.module.css";
import Link from "next/link";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLanguage } from "../context/LanguageContext"; // Contexto de idioma

// Traducciones
const translations = {
  es: {
    home: "INICIO",
    login: "INICIAR SESIÓN",
    signUp: "REGISTRARSE",
    loginTitle: "Iniciar Sesión",
    emailPlaceholder: "Correo Electrónico",
    passwordPlaceholder: "Contraseña",
    loginButton: "INICIAR SESIÓN",
    noAccount: "¿No tienes cuenta?",
    signUpHere: "REGÍSTRATE AQUÍ",
    successAdmin: "Inicio de sesión como administrador exitoso",
    successUser: "Inicio de sesión como usuario exitoso",
    errorRole: "Rol desconocido. Contacta al soporte.",
    errorUserNotFound: "Usuario no encontrado en la base de datos.",
    errorLogin: "Error al iniciar sesión. Verifica tus credenciales.",
  },
  en: {
    home: "HOME",
    login: "LOG IN",
    signUp: "SIGN UP",
    loginTitle: "Log In",
    emailPlaceholder: "Email Address",
    passwordPlaceholder: "Password",
    loginButton: "LOG IN",
    noAccount: "Don't have an account?",
    signUpHere: "SIGN UP HERE",
    successAdmin: "Admin login successful",
    successUser: "User login successful",
    errorRole: "Unknown role. Contact support.",
    errorUserNotFound: "User not found in the database.",
    errorLogin: "Login failed. Check your credentials.",
  },
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { language } = useLanguage(); // Obtener idioma actual del contexto
  const t = translations[language]; // Traducciones según el idioma

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Inicia sesión con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtén el rol del usuario desde Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "admin") {
          toast.success(t.successAdmin);
          router.push("/Admin"); // Redirigir al panel de administración
        } else if (userData.role === "user") {
          toast.success(t.successUser);
          router.push("/userHome"); // Redirigir al panel de usuario
        } else {
          toast.error(t.errorRole);
        }
      } else {
        toast.error(t.errorUserNotFound);
      }
    } catch (err) {
      toast.error(t.errorLogin);
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar />
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
            <Link href="/" className={styles.navItem}>
              {t.home}
            </Link>
          </li>
          <li>
            <Link href="/Login" className={`${styles.navItem} ${styles.active}`}>
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

      <div className={styles.formContainer}>
        <form className={styles.formBox} onSubmit={handleLogin}>
          <h2>{t.loginTitle}</h2>
          <div className={styles.inputBox}>
            <input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputBox}>
            <input
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.btn}>
            {t.loginButton}
          </button>
          <p className={styles.switchText}>
            {t.noAccount} <Link href="/SignUp">{t.signUpHere}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
