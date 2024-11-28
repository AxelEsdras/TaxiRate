"use client";

import React from 'react';
import styles from './home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bienvenido a Taxi Rate</h1>
      <p className={styles.description}>Esta es tu página principal después de iniciar sesión.</p>
    </div>
  );
}
