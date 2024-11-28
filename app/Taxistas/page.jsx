"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import styles from "./taxistas.module.css";
import { AiOutlineLogout, AiOutlineArrowLeft, AiOutlineSetting, AiOutlineUser, AiOutlineQuestionCircle } from "react-icons/ai";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useLanguage } from "../context/LanguageContext";

const translations = {
  es: {
    pageTitle: "TAXI RATE",
    sectionTitle: "Lista de Taxistas",
    searchPlaceholder: "Buscar taxista por nombre o número de taxi",
    searchButton: "Buscar",
    clearButton: "Limpiar",
    nameColumn: "Nombre",
    taxiNumberColumn: "Número de Taxi",
    platesColumn: "Placas",
    actionsColumn: "Acciones",
    qualifyButton: "Calificar",
    logoutTitle: "Cerrar sesión",
    configTitle: "Configuración",
    loading: "Cargando datos...",
  },
  en: {
    pageTitle: "TAXI RATE",
    sectionTitle: "Taxi List",
    searchPlaceholder: "Search taxi driver by name or taxi number",
    searchButton: "Search",
    clearButton: "Clear",
    nameColumn: "Name",
    taxiNumberColumn: "Taxi Number",
    platesColumn: "Plates",
    actionsColumn: "Actions",
    qualifyButton: "Qualify",
    logoutTitle: "Log Out",
    configTitle: "Settings",
    loading: "Loading data...",
  },
};

export default function Taxistas() {
  const [taxistas, setTaxistas] = useState([]);
  const [filteredTaxistas, setFilteredTaxistas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();
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
    const fetchTaxistas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "taxistas"));
        const taxistasData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTaxistas(taxistasData);
        setFilteredTaxistas(taxistasData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching taxistas:", error);
      }
    };

    fetchTaxistas();
  }, []);

  const handleSearch = () => {
    const filtered = taxistas.filter(
      (taxista) =>
        taxista.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        taxista.numTaxi.toString().includes(searchTerm)
    );
    setFilteredTaxistas(filtered);
  };

  const handleClear = () => {
    setSearchTerm("");
    setFilteredTaxistas(taxistas);
  };

  const goToRate = (taxista) => {
    router.push(`/rate?search=${encodeURIComponent(taxista.nombre)}`);
  };
  

  const handleLogout = () => {
    window.location.href = "/";
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

      <div className={styles.panel}>
        <h2 className={styles.title}>{t.sectionTitle}</h2>

        {loading ? (
          <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
            <Skeleton height={40} style={{ marginBottom: "20px" }} />
            <Skeleton count={3} height={30} />
          </SkeletonTheme>
        ) : (
          <>
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className={styles.searchButton} onClick={handleSearch}>
                {t.searchButton}
              </button>
              <button className={styles.clearButton} onClick={handleClear}>
                {t.clearButton}
              </button>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t.nameColumn}</th>
                    <th>{t.taxiNumberColumn}</th>
                    <th>{t.platesColumn}</th>
                    <th>{t.actionsColumn}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTaxistas.map((taxista) => (
                    <tr key={taxista.id}>
                      <td>{taxista.nombre}</td>
                      <td>{taxista.numTaxi}</td>
                      <td>{taxista.placas}</td>
                      <td>
                        <button
                          onClick={() => goToRate(taxista)}
                          className={styles.qualifyButton}
                        >
                          {t.qualifyButton}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
