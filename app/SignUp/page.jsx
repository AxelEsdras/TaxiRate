"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import styles from "./signup.module.css";
import Link from "next/link";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLanguage } from "../context/LanguageContext";

const translations = {
  es: {
    home: "INICIO",
    createAccount: "Crear Cuenta",
    username: "Nombre de Usuario",
    email: "Correo Electrónico",
    password: "Contraseña",
    createAccountBtn: "Crear Cuenta",
    haveAccount: "¿Ya tienes cuenta?",
    login: "INICIAR SESIÓN",
    signUp: "REGISTRARSE",
    verificationSent: "Se ha enviado un correo de confirmación. Por favor, verifica tu correo electrónico para completar el registro.",
    accountError: "Error al crear la cuenta. Intenta de nuevo.",
  },
  en: {
    home: "HOME",
    createAccount: "Create Account",
    username: "Username",
    email: "Email Address",
    password: "Password",
    createAccountBtn: "Create Account",
    haveAccount: "Already have an account?",
    login: "LOG IN",
    signUp: "SIGN UP",
    verificationSent: "A confirmation email has been sent. Please verify your email to complete registration.",
    accountError: "Error creating the account. Please try again.",
  },
};

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const { language } = useLanguage();
  const t = translations[language];

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Enviar correo de verificación
      await sendEmailVerification(user);
      toast.info(t.verificationSent);
  
      // Guardar datos en Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: username,
        email: email,
        role: "user",
      });
  
      // Esperar un tiempo antes de redirigir
      setTimeout(() => {
        router.push("/Login");
      }, 5000); // 5000ms = 5 segundos
    } catch (error) {
      toast.error(t.accountError);
      console.error(error);
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
            <Link href="/Login" className={styles.navItem}>
              {t.login}
            </Link>
          </li>
          <li>
            <Link href="/SignUp" className={`${styles.navItem} ${styles.active}`}>
              {t.signUp}
            </Link>
          </li>
        </ul>
      </header>

      <div className={styles.formContainer}>
        <form className={styles.formBox} onSubmit={handleSignUp}>
          <h2>{t.createAccount}</h2>
          <div className={styles.inputBox}>
            <input
              type="text"
              placeholder={t.username}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputBox}>
            <input
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputBox}>
            <input
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.btn}>{t.createAccountBtn}</button>
          <p className={styles.switchText}>
            {t.haveAccount} <Link href="/Login">{t.login}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
