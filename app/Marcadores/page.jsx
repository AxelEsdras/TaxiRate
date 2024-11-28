"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { db } from "../firebaseConfig";
import { collection, query, getDocs, where } from "firebase/firestore";
import styles from "./marcadores.module.css";
import Image from "next/image";
import {
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineQuestionCircle,
  AiOutlineArrowLeft,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";
import { useRouter } from "next/navigation";

// Traducciones
const translations = {
  es: {
    title: "TOP Mejores Taxistas",
    backButton: "Atrás",
    taxiNumber: "No. Taxi",
    licensePlate: "Placas",
    averageRating: "Calificación promedio",
    noData: "No hay registros disponibles.",
  },
  en: {
    title: "TOP Best Drivers",
    backButton: "Back",
    taxiNumber: "Taxi Number",
    licensePlate: "License Plate",
    averageRating: "Average Rating",
    noData: "No records available.",
  },
};

export default function Marcadores() {
  const [topTaxistas, setTopTaxistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage(); // Contexto de idioma
  const t = translations[language]; // Traducciones
  const router = useRouter(); // Navegación

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
    const fetchTopTaxistas = async () => {
      try {
        setLoading(true); // Mostrar el skeleton
  
        // Obtener todos los taxistas
        const taxistasQuery = query(collection(db, "taxistas"));
        const taxistasSnapshot = await getDocs(taxistasQuery);
        const taxistasData = taxistasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Obtener los comentarios de cada taxista y calcular el promedio
        const taxistasWithRatings = await Promise.all(
          taxistasData.map(async (taxista) => {
            const commentsQuery = query(
              collection(db, "comentarios"),
              where("id_taxista", "==", taxista.id)
            );
            const commentsSnapshot = await getDocs(commentsQuery);
            const commentsData = commentsSnapshot.docs.map((doc) => doc.data());
  
            // Calcular el promedio de calificaciones
            const totalRatings = commentsData.reduce(
              (sum, comment) => sum + comment.calificacion,
              0
            );
            const averageRating =
              commentsData.length > 0 ? totalRatings / commentsData.length : 0;
  
            return {
              ...taxista,
              promedio: averageRating,
            };
          })
        );
  
        // Ordenar por promedio descendente y tomar los 5 mejores
        const topTaxistasOrdenados = taxistasWithRatings
          .sort((a, b) => b.promedio - a.promedio)
          .slice(0, 5);
  
        setTopTaxistas(topTaxistasOrdenados);
      } catch (error) {
        console.error("Error fetching top taxistas:", error);
        setTopTaxistas([]); // Manejo de errores
      } finally {
        // Prolongar el skeleton a 2 segundos
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };
  
    fetchTopTaxistas();
  }, []);
  

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      return index < rating ? (
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
            <AiOutlineArrowLeft size={40} title={t.backButton} />
          </button>
          <button
            className={styles.navButton}
            onClick={() => router.push("/Ajustes")}
          >
            <AiOutlineSetting size={40} />
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
        <h1 className={styles.title}>{t.title}</h1>
        {loading ? (
          [...Array(5)].map((_, index) => (
            <div key={index} className={styles.cardSkeleton}>
              <div className={styles.imageSkeleton} />
              <div className={styles.textSkeleton} />
              <div className={styles.textSkeleton} />
              <div className={styles.textSkeleton} />
            </div>
          ))
        ) : topTaxistas.length > 0 ? (
          <div className={styles.taxistasContainer}>
            {topTaxistas.map((taxista) => (
              <div key={taxista.id} className={styles.card}>
                <div className={styles.imageContainer}>
                  <Image
                    src="/user-icon.png"
                    alt="User Icon"
                    width={50}
                    height={50}
                    className={styles.image}
                  />
                </div>
                <div className={styles.info}>
                  <p className={styles.name}>{taxista.nombre}</p>
                  <p>
                    <strong>{t.taxiNumber}:</strong> {taxista.numTaxi}
                  </p>
                  <p>
                    <strong>{t.licensePlate}:</strong> {taxista.placas}
                  </p>
                  <p>
                    <strong>{t.averageRating}:</strong>{" "}
                    {renderStars(Math.round(taxista.promedio || 0))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noData}>{t.noData}</p>
        )}
      </div>
    </div>
  );
}
