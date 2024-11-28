"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  AiOutlineArrowLeft,
  AiOutlineSetting,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import styles from "./moderador.module.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useLanguage } from "../context/LanguageContext";

// Traducciones
const translations = {
  es: {
    backToAdmin: "Volver a Admin",
    settings: "Configuración",
    taxiDriver: "Taxista",
    taxiNumber: "Número de Taxi",
    licensePlate: "Placas",
    averageRating: "Calificación promedio",
    user: "Usuario",
    comment: "Comentario",
    rating: "Calificación",
    delete: "Eliminar",
  },
  en: {
    backToAdmin: "Back to Admin",
    settings: "Settings",
    taxiDriver: "Driver",
    taxiNumber: "Taxi Number",
    licensePlate: "License Plate",
    averageRating: "Average Rating",
    user: "User",
    comment: "Comment",
    rating: "Rating",
    delete: "Delete",
  },
};

export default function Moderador() {
  const searchParams = useSearchParams();
  const taxistaId = searchParams.get("id");
  const taxistaNombre = searchParams.get("nombre");
  const taxistaNumTaxi = searchParams.get("numTaxi");
  const taxistaPlacas = searchParams.get("placas");

  const [comentarios, setComentarios] = useState([]);
  const [calificacionPromedio, setCalificacionPromedio] = useState(0);
  const [loading, setLoading] = useState(true); // Estado de carga

  const { language } = useLanguage(); // Obtener idioma actual
  const t = translations[language]; // Traducciones dinámicas

  // Función para obtener los comentarios y calcular el promedio
  const fetchComentarios = async () => {
    try {
      setLoading(true); // Iniciar carga
      const q = query(collection(db, "comentarios"), where("id_taxista", "==", taxistaId));
      const querySnapshot = await getDocs(q);

      const fetchedComentarios = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setComentarios(fetchedComentarios);

      // Calcular el promedio de calificaciones
      if (fetchedComentarios.length > 0) {
        const totalCalificaciones = fetchedComentarios.reduce(
          (sum, comment) => sum + comment.calificacion,
          0
        );
        setCalificacionPromedio(totalCalificaciones / fetchedComentarios.length);
      } else {
        setCalificacionPromedio(0);
      }

      setTimeout(() => setLoading(false), 2000); // Simular un retardo en la carga
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
    }
  };

  // Función para eliminar un comentario
  const handleEliminarComentario = async (comentarioId) => {
    try {
      await deleteDoc(doc(db, "comentarios", comentarioId));
      fetchComentarios(); // Actualizar la lista después de eliminar
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
    }
  };

  useEffect(() => {
    fetchComentarios();
  }, []);

  // Función para mostrar estrellas dinámicas
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
        <div className={styles.buttonsContainer}>
          <Link href="/Admin" className={styles.navButton}>
            <AiOutlineArrowLeft size={40} title={t.backToAdmin} />
          </Link>
          <Link href="/Ajustes" className={styles.navButton}>
            <AiOutlineSetting size={40} title={t.settings} />
          </Link>
        </div>
      </header>
      <div className={styles.panel}>
        {loading ? (
          <>
            {/* Skeleton para los detalles del taxista */}
            <Skeleton height={30} width="60%" />
            <Skeleton height={20} width="40%" style={{ marginTop: "10px" }} />
            <Skeleton height={20} width="40%" style={{ marginBottom: "20px" }} />

            {/* Skeleton para los comentarios */}
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
            <h2 className={styles.taxistaName}>
              {t.taxiDriver}: {taxistaNombre}
            </h2>
            <div className={styles.taxistaDetailsContainer}>
              <p className={styles.taxistaDetails}>
                {t.taxiNumber}: {taxistaNumTaxi}
              </p>
              <p className={styles.taxistaDetails}>
                {t.licensePlate}: {taxistaPlacas}
              </p>
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
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleEliminarComentario(comentario.id)}
                  >
                    {t.delete}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
