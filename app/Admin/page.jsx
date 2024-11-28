"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AiOutlineLogout, AiOutlineSetting } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import styles from "./AdminPanel.module.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useLanguage } from "../context/LanguageContext";

const translations = {
  es: {
    pageTitle: "TAXI RATE",
    sectionTitle: "Gestión de Taxistas",
    searchPlaceholder: "Buscar taxista por nombre o número de taxi",
    searchButton: "Buscar",
    clearButton: "Limpiar",
    nameColumn: "Nombre",
    taxiNumberColumn: "Número de Taxi",
    platesColumn: "Placas",
    actionsColumn: "Acciones",
    saveButton: "Guardar",
    cancelButton: "Cancelar",
    editButton: "Editar",
    deleteButton: "Eliminar",
    moderatorButton: "Moderador",
    registerNew: "Registrar Nuevo Taxista",
    logoutTitle: "Cerrar sesión",
    configTitle: "Configuración",
    loading: "Cargando datos del panel...",
  },
  en: {
    pageTitle: "TAXI RATE",
    sectionTitle: "Taxi Management",
    searchPlaceholder: "Search taxi driver by name or taxi number",
    searchButton: "Search",
    clearButton: "Clear",
    nameColumn: "Name",
    taxiNumberColumn: "Taxi Number",
    platesColumn: "Plates",
    actionsColumn: "Actions",
    saveButton: "Save",
    cancelButton: "Cancel",
    editButton: "Edit",
    deleteButton: "Delete",
    moderatorButton: "Moderator",
    registerNew: "Register New Taxi Driver",
    logoutTitle: "Log Out",
    configTitle: "Settings",
    loading: "Loading panel data...",
  },
};

export default function Admin() {
  const [taxistas, setTaxistas] = useState([]);
  const [filteredTaxistas, setFilteredTaxistas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingTaxista, setEditingTaxista] = useState(null);
  const [editedTaxista, setEditedTaxista] = useState({});
  const [newTaxista, setNewTaxista] = useState({ nombre: "", numTaxi: "", placas: "" });

  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

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

  useEffect(() => {
    setTimeout(() => {
      fetchTaxistas();
    }, 2000);
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

  const handleEditTaxista = async (id) => {
    try {
      const taxistaRef = doc(db, "taxistas", id);
      await updateDoc(taxistaRef, editedTaxista);
      fetchTaxistas();
      setEditingTaxista(null);
    } catch (error) {
      console.error("Error editing taxista:", error);
    }
  };

  const handleDeleteTaxista = async (id) => {
    try {
      await deleteDoc(doc(db, "taxistas", id));
      fetchTaxistas();
    } catch (error) {
      console.error("Error deleting taxista:", error);
    }
  };

  const handleAddTaxista = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "taxistas"), newTaxista);
      fetchTaxistas();
      setNewTaxista({ nombre: "", numTaxi: "", placas: "" });
    } catch (error) {
      console.error("Error adding taxista:", error);
    }
  };

  const goToModerador = (taxista) => {
    router.push(
      `/Moderador?id=${taxista.id}&nombre=${taxista.nombre}&numTaxi=${taxista.numTaxi}&placas=${taxista.placas}`
    );
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image src="/logo.jpg" alt="Logo Rate Taxi" width={100} height={100} />
          <span className={styles.pageTitle}>{t.pageTitle}</span>
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={handleLogout} className={styles.navButton}>
            <AiOutlineLogout size={40} title={t.logoutTitle} />
          </button>
          <Link href="/Ajustes" className={styles.navButton}>
            <AiOutlineSetting size={40} title={t.configTitle} />
          </Link>
        </div>
      </header>

      <div className={styles.panel}>
        <h2 className={styles.title}>{t.sectionTitle}</h2>

        {loading ? (
          <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
            <Skeleton height={40} style={{ marginBottom: "20px" }} />
            <Skeleton count={3} height={30} />
            <Skeleton height={150} style={{ marginTop: "20px" }} />
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

            <form className={styles.form} onSubmit={handleAddTaxista}>
              <input
                type="text"
                className={styles.formInput}
                placeholder={t.nameColumn}
                value={newTaxista.nombre}
                onChange={(e) => setNewTaxista({ ...newTaxista, nombre: e.target.value })}
                required
              />
              <input
                type="number"
                className={`${styles.formInput} ${styles.shortInput}`}
                placeholder={t.taxiNumberColumn}
                value={newTaxista.numTaxi}
                onChange={(e) => setNewTaxista({ ...newTaxista, numTaxi: e.target.value })}
                required
              />
              <input
                type="text"
                className={`${styles.formInput} ${styles.shortInput}`}
                placeholder={t.platesColumn}
                value={newTaxista.placas}
                onChange={(e) => setNewTaxista({ ...newTaxista, placas: e.target.value })}
                required
              />
              <button type="submit" className={styles.addButton}>{t.registerNew}</button>
            </form>

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
                    {filteredTaxistas.map((taxista) =>
                      editingTaxista === taxista.id ? (
                        <tr key={taxista.id}>
                          <td>
                            <input
                              className={styles.tableInput}
                              value={editedTaxista.nombre || ""}
                              onChange={(e) =>
                                setEditedTaxista({ ...editedTaxista, nombre: e.target.value })
                              }
                            />
                          </td>
                          <td>
                            <input
                              className={styles.tableInput}
                              value={editedTaxista.numTaxi || ""}
                              onChange={(e) =>
                                setEditedTaxista({ ...editedTaxista, numTaxi: e.target.value })
                              }
                            />
                          </td>
                          <td>
                            <input
                              className={styles.tableInput}
                              value={editedTaxista.placas || ""}
                              onChange={(e) =>
                                setEditedTaxista({ ...editedTaxista, placas: e.target.value })
                              }
                            />
                          </td>
                          <td>
                            <button
                              onClick={() => handleEditTaxista(taxista.id)}
                              className={styles.saveButton}
                            >
                              {t.saveButton}
                            </button>
                            <button
                              onClick={() => setEditingTaxista(null)}
                              className={styles.cancelButton}
                            >
                              {t.cancelButton}
                            </button>
                          </td>
                        </tr>
                      ) : (
                        <tr key={taxista.id}>
                          <td>{taxista.nombre}</td>
                          <td>{taxista.numTaxi}</td>
                          <td>{taxista.placas}</td>
                          <td>
                            <button
                              onClick={() => {
                                setEditingTaxista(taxista.id);
                                setEditedTaxista(taxista);
                              }}
                              className={styles.editButton}
                            >
                              {t.editButton}
                            </button>
                            <button
                              onClick={() => handleDeleteTaxista(taxista.id)}
                              className={styles.deleteButton}
                            >
                              {t.deleteButton}
                            </button>
                            <button
                              onClick={() => goToModerador(taxista)}
                              className={styles.moderatorButton}
                            >
                              {t.moderatorButton}
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

          </>
        )}
      </div>
    </div>
  );
}
