"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Importa useSearchParams
import { auth, db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import styles from "./rate.module.css";
import Image from "next/image";
import {
  AiOutlineLogout,
  AiOutlineSetting,
  AiFillStar,
  AiOutlineStar,
  AiOutlineUser,
  AiOutlineQuestionCircle,
  AiOutlineArrowLeft,
} from "react-icons/ai";
import { useLanguage } from "../context/LanguageContext";

const translations = {
  es: {
    searchPlaceholder: "Buscar taxista por nombre o número de taxi",
    searchButton: "Buscar",
    nameColumn: "Nombre",
    taxiNumberColumn: "Número de Taxi",
    platesColumn: "Placas",
    commentPlaceholder: "Escribe tu comentario",
    ratingTitle: "Calificación",
    commentButton: "Comentar",
    successMessage: "¡Comentario agregado exitosamente!",
    viewComments: "Ver Comentarios",
    logoutTitle: "Cerrar sesión",
    settingsTitle: "Ajustes",
    helpTitle: "Ayuda",
    profileTitle: "Perfil",
  },
  en: {
    searchPlaceholder: "Search taxi driver by name or taxi number",
    searchButton: "Search",
    nameColumn: "Name",
    taxiNumberColumn: "Taxi Number",
    platesColumn: "Plates",
    commentPlaceholder: "Write your comment",
    ratingTitle: "Rating",
    commentButton: "Submit",
    successMessage: "Comment added successfully!",
    viewComments: "View Comments",
    logoutTitle: "Log Out",
    settingsTitle: "Settings",
    helpTitle: "Help",
    profileTitle: "Profile",
  },
};

export default function Rate() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Inicializa useSearchParams
  const initialSearch = searchParams.get("search") || ""; // Obtén el valor inicial del parámetro search

  const [searchTerm, setSearchTerm] = useState(initialSearch); // Inicializa con el valor de la URL
  const [taxista, setTaxista] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("Usuario Anónimo");

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

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || "Usuario Anónimo");
          }
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    fetchUserName();
  }, []);

  const fetchTaxista = async () => {
    try {
      const q = query(
        collection(db, "taxistas"),
        where("nombre", "==", searchTerm)
      );
      const queryByNumber = query(
        collection(db, "taxistas"),
        where("numTaxi", "==", searchTerm)
      );

      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        querySnapshot = await getDocs(queryByNumber);
      }

      const taxistaData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))[0];

      if (taxistaData) {
        setTaxista(taxistaData);
      } else {
        alert("No se encontró el taxista.");
      }
    } catch (error) {
      console.error("Error fetching taxista:", error);
    }
  };

  const handleComment = async () => {
    if (taxista && comment && rating) {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("Debes iniciar sesión para dejar un comentario.");
          return;
        }

        await addDoc(collection(db, "comentarios"), {
          id_taxista: taxista.id,
          id_user: user.uid,
          comentario: comment,
          calificacion: rating,
          nombre_usuario: userName,
          fecha: new Date(),
        });

        setComment("");
        setRating(0);

        alert(t.successMessage);
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const renderStars = (selectedRating) => {
    return Array.from({ length: 5 }, (_, index) => {
      return index < selectedRating ? (
        <AiFillStar
          key={index}
          className={`${styles.star} ${styles.starClickable}`}
          onClick={() => setRating(index + 1)}
        />
      ) : (
        <AiOutlineStar
          key={index}
          className={`${styles.star} ${styles.starClickable}`}
          onClick={() => setRating(index + 1)}
        />
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

      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.searchButton} onClick={fetchTaxista}>
          {t.searchButton}
        </button>
      </div>

      {taxista && (
        <div className={styles.taxistaInfo}>
          <h2>{taxista.nombre}</h2>
          <p>{t.taxiNumberColumn}: {taxista.numTaxi}</p>
          <p>{t.platesColumn}: {taxista.placas}</p>

          <div className={styles.commentForm}>
            <h3>{t.ratingTitle}</h3>
            <div className={styles.ratingContainer}>{renderStars(rating)}</div>
            <textarea
              className={styles.commentInput}
              placeholder={t.commentPlaceholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className={styles.submitButton} onClick={handleComment}>
              {t.commentButton}
            </button>
            <button
              className={styles.viewCommentsButton}
              onClick={() =>
                router.push(
                  `/comments?id=${taxista.id}&nombre=${taxista.nombre}&numTaxi=${taxista.numTaxi}&placas=${taxista.placas}`
                )
              }
            >
              {t.viewComments}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
