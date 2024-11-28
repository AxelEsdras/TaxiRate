"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebaseConfig";
import Image from "next/image";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import styles from "./historial.module.css";
import { AiOutlineArrowLeft, AiOutlineSetting, AiOutlineUser, AiOutlineQuestionCircle } from "react-icons/ai";
import { useLanguage } from "../context/LanguageContext";

// Traducciones
const translations = {
  es: {
    title: "Historial de Comentarios",
    backButton: "Atrás",
    user: "Usuario",
    comment: "Comentario",
    rating: "Calificación",
    taxiNumber: "Número de Taxi",
    driverName: "Nombre del Taxista",
    date: "Fecha",
    noComments: "No hay comentarios disponibles.",
  },
  en: {
    title: "Comment History",
    backButton: "Back",
    user: "User",
    comment: "Comment",
    rating: "Rating",
    taxiNumber: "Taxi Number",
    driverName: "Driver Name",
    date: "Date",
    noComments: "No comments available.",
  },
};

export default function Historial() {
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage(); // Contexto de idioma
  const t = translations[language]; // Traducciones

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
    const fetchComments = async () => {
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is logged in");
        router.push("/Login");
        return;
      }

      try {
        setLoading(true);
        const q = query(
          collection(db, "comentarios"),
          where("id_user", "==", user.uid),
          orderBy("fecha", "desc")
        );

        const querySnapshot = await getDocs(q);

        const commentsData = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const comment = docSnap.data();

            // Buscar información del taxista basado en id_taxista
            const taxistaRef = doc(db, "taxistas", comment.id_taxista);
            const taxistaSnapshot = await getDoc(taxistaRef);

            if (taxistaSnapshot.exists()) {
              const taxistaData = taxistaSnapshot.data();
              comment.numTaxi = taxistaData.numTaxi || "Desconocido";
              comment.nombreTaxista = taxistaData.nombre || "Desconocido";
            } else {
              comment.numTaxi = "Desconocido";
              comment.nombreTaxista = "Desconocido";
            }

            return comment;
          })
        );

        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [router]);

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

      <div className={styles.panel}>
      <h2 className={styles.subTitle}>{t.title}</h2>

        {loading ? (
          [...Array(5)].map((_, index) => (
            <div key={index} className={styles.skeletonCard}>
              <div className={styles.skeletonText} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonText} />
            </div>
          ))
        ) : comments.length > 0 ? (
          <div className={styles.commentsContainer}>
            {comments.map((comment, index) => (
              <div key={index} className={styles.commentCard}>
                <p>
                  <strong>{t.comment}:</strong> {comment.comentario}
                </p>
                <p>
                  <strong>{t.rating}:</strong> {comment.calificacion} ⭐
                </p>
                <p>
                  <strong>{t.driverName}:</strong> {comment.nombreTaxista}
                </p>
                <p>
                  <strong>{t.taxiNumber}:</strong> {comment.numTaxi}
                </p>
                <p>
                  <strong>{t.date}:</strong>{" "}
                  {new Date(comment.fecha.seconds * 1000).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>{t.noComments}</p>
        )}
      </div>
    </div>
  );
}
