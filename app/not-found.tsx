import Image from "next/image";
import Link from "next/link";

import { brand } from "@/lib/brand";

import styles from "./page.module.css";

/** Branded, non-commerce not-found response for unsupported routes. */
export default function NotFound() {
  return (
    <div className={styles["page"]}>
      <header className={styles["header"]}>
        <Link className={styles["logoLink"]} href="/" aria-label={`${brand.name} home`}>
          <Image
            className={styles["logoImage"]}
            src={brand.hero.image.src}
            width={1280}
            height={1280}
            alt={brand.hero.image.alt}
            priority
          />
        </Link>
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
