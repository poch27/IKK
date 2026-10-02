import Image from "next/image";

import { brand } from "@/lib/brand";
import {
  DROP_IMAGE_HEIGHT,
  DROP_IMAGE_WIDTH,
  dropProducts,
  formatPrice,
  fromPrice,
} from "@/lib/drop";
import { primaryVisual, siteConfig } from "@/lib/site";

import styles from "./page.module.css";
import { WaitlistForm } from "./waitlist-form";

/** The single public drop page. All copy comes from lib/brand.ts. */
export default function HomePage() {
  const from = formatPrice(fromPrice());
  const heroProduct = dropProducts[0];
  const pieceCount = String(dropProducts.length).padStart(2, "0");

  return (
    <div className={styles["page"]}>
      <p className={styles["strip"]}>{brand.strip}</p>

      <header className={styles["header"]}>
        <p className={styles["wordmark"]}>
          <span className={styles["wordmarkLight"]}>{brand.wordmark.light}</span>
          <span className={styles["wordmarkHeavy"]}>{brand.wordmark.heavy}</span>
        </p>
        <a className={styles["headerLink"]} href="#waitlist-form">
          {brand.headerCta} <span aria-hidden="true">→</span>
        </a>
      </header>

      <main id="main-content" className={styles["main"]}>
        <section className={styles["hero"]} aria-labelledby="hero-heading">
          <div className={styles["heroText"]}>
            <p className={styles["kicker"]}>{brand.hero.kicker}</p>
            <h1 id="hero-heading" className={styles["heroTitle"]}>
              {brand.hero.titleLead}{" "}
              <span className={styles["accent"]}>{brand.hero.titleAccent}</span>
            </h1>
            <p className={styles["heroSub"]}>{brand.hero.sub(from)}</p>
            <div className={styles["heroActions"]}>
              <a className={styles["primaryButton"]} href="#waitlist-form">
                {brand.hero.primaryCta}
              </a>
              <a className={styles["textLink"]} href="#drop">
                {brand.hero.secondaryCta} <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className={styles["heroMeta"]}>{brand.hero.meta(dropProducts.length, from)}</p>
          </div>

          <figure className={styles["heroFigure"]}>
            <div className={styles["heroFrame"]}>
              <Image
                className={styles["fillImage"]}
                src={primaryVisual.src}
                width={primaryVisual.width}
                height={primaryVisual.height}
                alt={primaryVisual.alt}
                sizes="(min-width: 64rem) 40vw, 100vw"
                priority
                unoptimized
              />
            </div>
            {heroProduct !== undefined ? (
              <figcaption className={styles["caption"]}>
                {heroProduct.name} — {heroProduct.colorway} — {formatPrice(heroProduct.price)}
              </figcaption>
            ) : null}
          </figure>
        </section>

        <section id="drop" className={styles["drop"]} aria-labelledby="drop-heading">
          <div className={styles["dropHeader"]}>
            <h2 id="drop-heading" className={styles["dropTitle"]}>
              {brand.drop.heading} <span className={styles["dropCount"]}>({pieceCount})</span>
            </h2>
            <p className={styles["dropLine"]}>{brand.drop.line}</p>
          </div>

          <div
            className={styles["rail"]}
            tabIndex={0}
            role="region"
            aria-label={brand.drop.listLabel}
          >
            <ul className={styles["productList"]}>
              {dropProducts.map((product) => (
                <li key={product.id} className={styles["card"]}>
                  <div className={styles["cardFrame"]}>
                    <Image
                      className={styles["fillImage"]}
                      src={product.image}
                      width={DROP_IMAGE_WIDTH}
                      height={DROP_IMAGE_HEIGHT}
                      alt={product.alt}
                      sizes="(min-width: 64rem) 25vw, (min-width: 48rem) 50vw, 78vw"
                      unoptimized
                    />
                  </div>
                  <div className={styles["cardMeta"]}>
                    <div className={styles["cardRow"]}>
                      <h3 className={styles["cardName"]}>
                        <span className={styles["cardIndex"]}>{product.index}</span>
                        {product.name}
                      </h3>
                      <p className={styles["cardPrice"]}>{formatPrice(product.price)}</p>
                    </div>
                    <div className={styles["cardRow"]}>
                      <p className={styles["cardColor"]}>{product.colorway}</p>
                      <p className={styles["cardSizes"]}>Sizes {product.sizes}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className={styles["note"]}>{brand.drop.note}</p>
        </section>

        <section className={styles["idea"]} aria-labelledby="idea-heading">
          <h2 id="idea-heading" className={styles["sectionLabel"]}>
            {brand.idea.label}
          </h2>
          <div className={styles["ideaGrid"]}>
            <div>
              <h3 className={styles["listLabel"]}>{brand.idea.notLabel}</h3>
              <ul className={styles["notList"]}>
                {brand.idea.notItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={styles["listLabel"]}>{brand.idea.inLabel}</h3>
              <ul className={styles["inList"]}>
                {brand.idea.inItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className={styles["ideaClose"]}>{brand.idea.closing}</p>
        </section>

        <section className={styles["how"]} aria-labelledby="how-heading">
          <h2 id="how-heading" className={styles["sectionLabel"]}>
            {brand.how.label}
          </h2>
          <ol className={styles["steps"]}>
            {brand.how.steps.map((step) => (
              <li key={step.number} className={styles["step"]}>
                <span className={styles["stepNumber"]} aria-hidden="true">
                  {step.number}
                </span>
                <h3 className={styles["stepTitle"]}>{step.title}</h3>
                <p className={styles["stepBody"]}>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="waitlist-form"
          className={styles["signup"]}
          aria-labelledby="waitlist-heading"
        >
          <div className={styles["signupInner"]}>
            <h2 id="waitlist-heading" className={styles["signupTitle"]}>
              {brand.signup.heading}
            </h2>
            <p className={styles["signupSub"]}>{brand.signup.sub}</p>
            <WaitlistForm privacyContactEmail={siteConfig.privacyContactEmail} />
          </div>
        </section>
      </main>

      <footer className={styles["footer"]}>
        <p className={styles["footerMark"]} aria-hidden="true">
          <span className={styles["wordmarkLight"]}>{brand.wordmark.light}</span>
          <span className={styles["wordmarkHeavy"]}>{brand.wordmark.heavy}</span>
        </p>
        <div className={styles["footerRow"]}>
          <a
            className={styles["footerLink"]}
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {brand.footer.instagramLabel} <span aria-hidden="true">↗</span>
            <span className={styles["visuallyHidden"]}> (opens in a new tab)</span>
          </a>
          <p className={styles["copyright"]}>{brand.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
