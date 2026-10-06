import Image from "next/image";
import Link from "next/link";

import { brand } from "@/lib/brand";
import {
  DROP_IMAGE_HEIGHT,
  DROP_IMAGE_WIDTH,
  dropProducts,
  formatPrice,
  fromPrice,
} from "@/lib/drop";
import { primaryVisual, siteConfig } from "@/lib/site";

import { ImmersiveVisual } from "./immersive-visual";
import { Reveal } from "./motion-reveal";
import styles from "./page.module.css";
import { WaitlistForm } from "./waitlist-form";

/** The single public IKK transmission page. Brand content comes from lib/brand.ts. */
export default function HomePage() {
  const from = formatPrice(fromPrice());
  const pieceCount = String(dropProducts.length).padStart(2, "0");

  return (
    <div className={styles["page"]}>
      <header className={styles["header"]}>
        <Link className={styles["logoLink"]} href="/" aria-label={`${brand.name} home`}>
          <Image
            className={styles["logoImage"]}
            src={primaryVisual.src}
            width={1280}
            height={1280}
            alt={primaryVisual.alt}
            priority
          />
        </Link>
        <p className={styles["headerStatus"]}>
          <span aria-hidden="true" /> {brand.og.badge}
        </p>
        <a className={styles["headerLink"]} href="#waitlist-form">
          {brand.headerCta} <span aria-hidden="true">↘</span>
        </a>
      </header>

      <main id="main-content" className={styles["main"]}>
        <section className={styles["hero"]} aria-labelledby="hero-heading">
          <div className={styles["heroScene"]}>
            <ImmersiveVisual
              logoSrc={primaryVisual.src}
              logoAlt={primaryVisual.alt}
              transmissionLabel={brand.og.kicker}
            />
          </div>

          <div className={styles["heroCopy"]}>
            <Reveal eager delay={0.08}>
              <p className={styles["kicker"]}>{brand.hero.kicker}</p>
            </Reveal>
            <Reveal eager delay={0.18} distance={42}>
              <h1 id="hero-heading" className={styles["heroTitle"]}>
                <span>{brand.hero.titleLead}</span>
                <strong>{brand.hero.titleAccent}</strong>
              </h1>
            </Reveal>
            <Reveal eager delay={0.34}>
              <p className={styles["heroSub"]}>{brand.hero.sub(from)}</p>
            </Reveal>
            <Reveal eager delay={0.42}>
              <ul className={styles["heroBenefits"]}>
                {brand.hero.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal eager delay={0.52}>
              <div className={styles["heroActions"]}>
                <a className={styles["primaryButton"]} href="#waitlist-form">
                  {brand.hero.primaryCta} <span aria-hidden="true">↘</span>
                </a>
                <a className={styles["textLink"]} href="#drop">
                  {brand.hero.secondaryCta} <span aria-hidden="true">↓</span>
                </a>
              </div>
            </Reveal>
          </div>

          <div className={styles["heroIndex"]} aria-hidden="true">
            <span>{brand.og.badge}</span>
            <strong>01</strong>
          </div>
          <p className={styles["heroMeta"]}>{brand.hero.meta(dropProducts.length, from)}</p>
        </section>

        <div className={styles["signalBand"]} aria-hidden="true">
          <div className={styles["signalTrack"]}>
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index}>
                {brand.name} / {brand.og.tagline} / {brand.name} / {brand.og.kicker}
              </span>
            ))}
          </div>
        </div>

        <section id="drop" className={styles["drop"]} aria-labelledby="drop-heading">
          <Reveal className={styles["dropIntro"]}>
            <p className={styles["sectionLabel"]}>{brand.drop.listLabel}</p>
            <h2 id="drop-heading" className={styles["dropTitle"]}>
              {brand.drop.heading}
            </h2>
            <p className={styles["dropLine"]}>{brand.drop.line}</p>
          </Reveal>

          <ul className={styles["productList"]}>
            {dropProducts.map((product) => (
              <li key={product.id} className={styles["product"]}>
                <Reveal className={styles["productVisual"]} distance={48}>
                  <div className={styles["productFrame"]}>
                    {product.image === "" ? (
                      <div
                        className={styles["productPlaceholder"]}
                        role="img"
                        aria-label={product.alt}
                      >
                        <Image
                          className={styles["placeholderLogo"]}
                          src={primaryVisual.src}
                          width={1280}
                          height={1280}
                          alt=""
                          aria-hidden="true"
                        />
                        <span className={styles["placeholderCode"]}>VISUAL / PENDING</span>
                        <span className={styles["placeholderLabel"]}>{product.alt}</span>
                      </div>
                    ) : (
                      <Image
                        className={styles["fillImage"]}
                        src={product.image}
                        width={DROP_IMAGE_WIDTH}
                        height={DROP_IMAGE_HEIGHT}
                        alt={product.alt}
                        sizes="(min-width: 64rem) 56vw, 92vw"
                      />
                    )}
                    <span className={styles["productStamp"]} aria-hidden="true">
                      {product.index} / {pieceCount}
                    </span>
                  </div>
                </Reveal>

                <Reveal className={styles["productDetails"]} delay={0.12}>
                  <p className={styles["productCode"]}>{brand.hero.kicker}</p>
                  <h3 className={styles["productName"]}>{product.name}</h3>
                  <p className={styles["productStatement"]}>{brand.drop.line}</p>
                  <dl className={styles["productMeta"]}>
                    <div>
                      <dt>Colour system</dt>
                      <dd>{product.colorway}</dd>
                    </div>
                    <div>
                      <dt>Available sizes</dt>
                      <dd>{product.sizes}</dd>
                    </div>
                    <div>
                      <dt>Launch price</dt>
                      <dd>{formatPrice(product.price)}</dd>
                    </div>
                  </dl>
                  <a className={styles["productCta"]} href="#waitlist-form">
                    {brand.hero.primaryCta} <span aria-hidden="true">→</span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>

          <p className={styles["note"]}>{brand.drop.note}</p>
        </section>

        <section className={styles["idea"]} aria-labelledby="idea-heading">
          <Reveal>
            <p className={styles["sectionLabel"]}>{brand.idea.label}</p>
          </Reveal>
          <Reveal distance={52}>
            <h2 id="idea-heading" className={styles["ideaStatement"]}>
              {brand.idea.closing}
            </h2>
          </Reveal>

          <div className={styles["ideaGrid"]}>
            <Reveal delay={0.08}>
              <div className={styles["ideaColumn"]}>
                <h3 className={styles["listLabel"]}>{brand.idea.notLabel}</h3>
                <ul className={styles["notList"]}>
                  {brand.idea.notItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <div className={`${styles["ideaColumn"]} ${styles["ideaColumnSignal"]}`}>
                <h3 className={styles["listLabel"]}>{brand.idea.inLabel}</h3>
                <ul className={styles["inList"]}>
                  {brand.idea.inItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        <section className={styles["how"]} aria-labelledby="how-heading">
          <Reveal className={styles["howHeader"]}>
            <p className={styles["sectionLabel"]}>{brand.how.label}</p>
            <h2 id="how-heading" className={styles["howTitle"]}>
              {brand.how.heading}
            </h2>
          </Reveal>
          <ol className={styles["steps"]}>
            {brand.how.steps.map((step, index) => (
              <li key={step.number} className={styles["step"]}>
                <Reveal delay={index * 0.1}>
                  <span className={styles["stepNumber"]} aria-hidden="true">
                    {step.number}
                  </span>
                  <h3 className={styles["stepTitle"]}>{step.title}</h3>
                  <p className={styles["stepBody"]}>{step.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="waitlist-form"
          className={styles["signup"]}
          aria-labelledby="waitlist-heading"
        >
          <div className={styles["signupMark"]} aria-hidden="true">
            {brand.name}
          </div>
          <Reveal className={styles["signupInner"]}>
            <p className={styles["sectionLabel"]}>{brand.og.kicker}</p>
            <h2 id="waitlist-heading" className={styles["signupTitle"]}>
              {brand.signup.heading}
            </h2>
            <p className={styles["signupSub"]}>{brand.signup.sub}</p>
            <WaitlistForm privacyContactEmail={siteConfig.privacyContactEmail} />
          </Reveal>
        </section>
      </main>

      <footer className={styles["footer"]}>
        <div className={styles["footerIdentity"]}>
          <Image
            className={styles["footerLogo"]}
            src={primaryVisual.src}
            width={1280}
            height={1280}
            alt=""
            aria-hidden="true"
          />
          <p>{brand.og.tagline}</p>
        </div>
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
