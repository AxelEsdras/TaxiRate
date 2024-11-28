"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("es");

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") || "es";
    setLanguage(storedLanguage);
  }, []);

  const changeLanguage = (newLanguage) => {
    localStorage.setItem("language", newLanguage);
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}
