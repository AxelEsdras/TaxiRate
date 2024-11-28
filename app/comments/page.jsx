"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineArrowLeft, AiOutlineSetting, AiOutlineStar, AiFillStar, AiOutlineUser, AiOutlineQuestionCircle } from "react-icons/ai";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import styles from "./comments.module.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useLanguage } from "../context/LanguageContext";

// Traducciones
const translations = {
  es: {
    back: "Volver",
    settings: "Ajustes",
    driver: "Taxista",
    taxiNumber: "Número de Taxi",
    licensePlate: "Placas",
    averageRating: "Calificación promedio",
    user: "Usuario",
    comment: "Comentario",
    rating: "Calificación",
  },
  en: {
    back: "Back",
    settings: "Settings",
    driver: "Driver",
    taxiNumber: "Taxi Number",
    licensePlate: "License Plate",
    averageRating: "Average Rating",
    user: "User",
    comment: "Comment",
    rating: "Rating",
  },
};

export default function Comments() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taxistaId = searchParams.get("id");
  const taxistaNombre = searchParams.get("nombre");
  const taxistaNumTaxi = searchParams.get("numTaxi");
  const taxistaPlacas = searchParams.get("placas");

  const [comentarios, setComentarios] = useState([]);
  const [calificacionPromedio, setCalificacionPromedio] = useState(0);
  const [loading, setLoading] = useState(true); // Estado de carga

  const { language } = useLanguage();
  const t = translations[language];

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

  // Función para obtener comentarios y promedio
  const fetchComentarios = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "comentarios"), where("id_taxista", "==", taxistaId));
      const querySnapshot = await getDocs(q);

      const fetchedComentarios = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setComentarios(fetchedComentarios);

      // Calcular promedio de calificaciones
      if (fetchedComentarios.length > 0) {
        const totalCalificaciones = fetchedComentarios.reduce((sum, comment) => sum + comment.calificacion, 0);
        setCalificacionPromedio(totalCalificaciones / fetchedComentarios.length);
      } else {
        setCalificacionPromedio(0);
      }

      setTimeout(() => setLoading(false), 1500); // Simular un retardo en la carga
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
    }
  };

  useEffect(() => {
    fetchComentarios();
  }, []);

  // Función para renderizar estrellas dinámicas
  const renderStars = (calificacion) => {
    return Array.from({ length: 5 }, (_, index) => {
      return index < calificacion ? (
        <AiFillStar key={index} className={styles.star} />
      ) : (
        <AiOutlineStar key={index} className={styles.star} />
      );
    });
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
            <AiOutlineArrowLeft size={40} title={t.backToAdmin} />
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
        {loading ? (
          <>
            <Skeleton height={30} width="60%" />
            <Skeleton height={20} width="40%" style={{ marginTop: "10px" }} />
            <Skeleton height={20} width="40%" style={{ marginBottom: "20px" }} />

            {[...Array(3)].map((_, index) => (
              <div key={index} className={styles.commentCard}>
                <Skeleton height={20} width="80%" />
                <Skeleton height={20} width="60%" style={{ marginTop: "10px" }} />
                <Skeleton height={20} width="40%" style={{ marginTop: "10px" }} />
              </div>
            ))}
          </>
        ) : (
          <>
            <h2 className={styles.taxistaName}>{t.driver}: {taxistaNombre}</h2>
            <div className={styles.taxistaDetailsContainer}>
              <p className={styles.taxistaDetails}>{t.taxiNumber}: {taxistaNumTaxi}</p>
              <p className={styles.taxistaDetails}>{t.licensePlate}: {taxistaPlacas}</p>
            </div>
            <h3 className={styles.ratingTitle}>
              {t.averageRating}: {renderStars(Math.round(calificacionPromedio))}
            </h3>
            <div className={styles.commentsContainer}>
              {comentarios.map((comentario) => (
                <div key={comentario.id} className={styles.commentCard}>
                  <p>
                    <strong>{t.user}:</strong> {comentario.nombre_usuario}
                  </p>
                  <p>
                    <strong>{t.comment}:</strong> {comentario.comentario}
                  </p>
                  <p>
                    <strong>{t.rating}:</strong> {renderStars(comentario.calificacion)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
