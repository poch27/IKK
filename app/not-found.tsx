import Link from "next/link";

import { brand } from "@/lib/brand";

import styles from "./page.module.css";

/** Branded, non-commerce not-found response for unsupported routes. */
export default function NotFound() {
  return (
    <div className={styles["page"]}>
      <p className={styles["strip"]}>{brand.strip}</p>

      <header className={styles["header"]}>
        <p className={styles["wordmark"]}>
          <span className={styles["wordmarkLight"]}>{brand.wordmark.light}</span>
          <span className={styles["wordmarkHeavy"]}>{brand.wordmark.heavy}</span>
        </p>
      </header>

      <main id="main-content" className={`${styles["main"]} ${styles["notFound"]}`}>
        <p className={styles["notFoundCode"]} aria-hidden="true">
          404
        </p>
        <h1 className={styles["notFoundTitle"]}>{brand.notFound.title}</h1>
        <Link className={styles["primaryButton"]} href="/">
          {brand.notFound.cta}
        </Link>
      </main>
    </div>
  );
}
