
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import UrumayaLogo from "../components/UrumayaLogo";
import { getCategories } from "../api/categories";

const IMG = "/images/urumaya";

// Fallback images for craft collections
const categoryFallbackImages = {
  pottery: `${IMG}/pottery.png`,
  textiles: `${IMG}/weaving.png`,
  masks: `${IMG}/masks.png`,
  brassware: `${IMG}/brassware.png`,
  "dumbara-weaving": `${IMG}/artisan-weaving.png`,
};

const defaultCategoryImage = `${IMG}/hero.png`;

const islandCards = [
  { title: "Coast", image: `${IMG}/coast.png` },
  { title: "Highlands", image: `${IMG}/sigiriya.png` },
  { title: "Heritage", image: `${IMG}/hero.png` },
  { title: "Craft", image: `${IMG}/artisan-weaving.png` },
];

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`urumaya-scroll-reveal ${
        visible ? "is-visible" : ""
      } ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  // Load active craft categories from MongoDB
  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const response = await getCategories();

        if (!active) return;

        setCategories(response.data || []);
        setCategoriesError("");
      } catch (error) {
        if (!active) return;

        console.error(
          "Failed to load homepage categories:",
          error
        );

        setCategoriesError(
          "Collections are temporarily unavailable."
        );
      } finally {
        if (active) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="overflow-hidden bg-urumaya-forest text-urumaya-ivory">
      {/* ==========================================
          HERO + OVERLAPPING EXPERIENCE
      ========================================== */}

      <section className="relative min-h-[920px] overflow-hidden bg-urumaya-forest pb-8 lg:min-h-[880px]">
        <img
          src={`${IMG}/hero.png`}
          alt="Sri Lankan heritage portrait surrounded by tropical greenery"
          className="urumaya-hero-image absolute inset-0 h-full w-full object-cover object-[65%_top] lg:object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#071F22]/85 via-[#071F22]/30 to-[#071F22]/5" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[#071F22]/95 via-[#071F22]/35 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-44 sm:px-10 lg:px-14 lg:pt-48">
          <div className="max-w-[780px]">
            <div className="urumaya-hero-content mb-5 flex items-center gap-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-urumaya-gold sm:text-xs">
                The URUMAYA Edit
              </span>

              <span className="h-px w-24 bg-urumaya-gold" />
            </div>

            <h1 className="urumaya-hero-content font-display text-[clamp(43px,6.5vw,94px)] font-normal leading-[0.91] tracking-[-0.035em]">
              <span className="block">An Island of</span>
              <span className="block">Stories. A Legacy</span>
              <span className="block">of Craft.</span>
            </h1>

            <p className="urumaya-hero-content mt-7 max-w-[430px] text-sm leading-7 text-white/90 sm:text-base">
              Discover the beauty, traditions, and artistry
              <br className="hidden sm:block" />
              of Sri Lanka.
            </p>

            <a
              href="#stories"
              className="urumaya-hero-content group mt-7 inline-flex items-center gap-5 rounded-full bg-urumaya-terracotta px-7 py-4 text-xs font-semibold text-white transition-all hover:-translate-y-1 hover:bg-[#CC7050]"
            >
              Explore Our Heritage

              <span className="text-lg transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>

            <a
              href="#stories"
              className="urumaya-hero-content mt-9 flex w-fit items-center gap-3 text-[11px] text-white/90"
            >
              <span className="urumaya-scroll-arrow text-xl">
                ↓
              </span>

              Scroll to Explore
            </a>
          </div>
        </div>

        {/* OVERLAPPING EXPERIENCE PANEL */}

        <div
          id="stories"
          className="relative z-10 mx-auto mt-4 w-[calc(100%-32px)] max-w-[1200px] rounded-[28px] border border-white/20 bg-[#06483F]/70 p-6 shadow-2xl backdrop-blur-xl sm:w-[calc(100%-64px)] sm:p-9 lg:mt-0"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-urumaya-gold">
                The URUMAYA Experience
              </p>

              <h2 className="mt-3 font-display text-5xl leading-[0.9] sm:text-6xl">
                Every Craft
                <br />
                Has a Story.
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-6 text-white/85">
                From the hands of local artisans to the cultural
                traditions that inspire their work.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Discover", "Experience", "Preserve"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-urumaya-gold/60 px-4 py-2 text-[11px] text-white"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="urumaya-story-stack grid h-[220px] grid-cols-3 gap-2 sm:h-[270px] lg:h-[285px]">
                {[
                  {
                    image: `${IMG}/artisan-weaving.png`,
                    alt: "Sri Lankan artisan weaving textiles",
                  },
                  {
                    image: `${IMG}/coast.png`,
                    alt: "Sri Lankan tropical coastline",
                  },
                  {
                    image: `${IMG}/sigiriya.png`,
                    alt: "Sigiriya heritage landscape",
                  },
                ].map((item, index) => (
                  <div
                    key={item.image}
                    className={`urumaya-story-photo urumaya-story-photo-${
                      index + 1
                    } overflow-hidden rounded-2xl border border-white/20`}
                  >
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==========================================
          CURATED CRAFT COLLECTIONS
      ========================================== */}

      <section className="bg-urumaya-ivory px-6 py-16 text-urumaya-ink sm:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="font-display text-2xl">
                  Our Curated Collection
                </p>

                <h2 className="mt-1 font-display text-5xl leading-none sm:text-6xl">
                  Find Your Treasure
                </h2>
              </div>

              <Link
                to="/shop"
                className="inline-flex w-fit items-center gap-3 border-b border-urumaya-ink pb-1 text-xs font-medium hover:text-urumaya-terracotta"
              >
                View All Collections
                <span>→</span>
              </Link>
            </div>
          </Reveal>

          {/* DYNAMIC CATEGORY CARDS */}

          {categoriesLoading ? (
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="aspect-[4/4.2] animate-pulse rounded-2xl bg-urumaya-sand"
                  />
                )
              )}
            </div>
          ) : categoriesError ? (
            <p
              className="mt-8 text-sm text-urumaya-ink/60"
              role="alert"
            >
              {categoriesError}
            </p>
          ) : categories.length === 0 ? (
            <p className="mt-8 text-sm text-urumaya-ink/60">
              Our craft collections are coming soon.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {categories.map((category, index) => (
                <Reveal
                  key={category._id}
                  delay={(index % 4) * 80}
                >
                  <Link
                    to={`/shop?category=${encodeURIComponent(
                      category.slug
                    )}`}
                    className="group relative block aspect-[4/4.2] overflow-hidden rounded-2xl bg-urumaya-sand"
                  >
                    <img
                      src={
                        category.coverImage ||
                        categoryFallbackImages[
                          category.slug
                        ] ||
                        defaultCategoryImage
                      }
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-display text-xl sm:text-2xl">
                        {category.name}
                      </h3>

                      {category.description && (
                        <p className="mt-1 line-clamp-2 text-[11px] text-white/85">
                          {category.description}
                        </p>
                      )}

                      <span className="mt-3 inline-block text-[10px] font-semibold uppercase tracking-widest text-urumaya-gold">
                        Explore Collection
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          EXPLORE THE ISLAND
      ========================================== */}

      <section
        id="explore"
        className="relative overflow-hidden bg-urumaya-forest px-6 py-16 sm:px-10 lg:py-20"
      >
        <img
          src={`${IMG}/sigiriya.png`}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#071F22]/95 to-[#071F22]/70" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <h2 className="font-display text-5xl leading-none sm:text-6xl">
              Explore the Island
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/85">
              From golden beaches to ancient temples,
              experience the soul of Sri Lanka.
            </p>

            <a
              href="#island-themes"
              className="mt-6 inline-flex items-center gap-4 rounded-full bg-urumaya-terracotta px-6 py-3 text-xs font-medium text-white hover:bg-[#CC7050]"
            >
              Discover Sri Lanka
              <span>→</span>
            </a>
          </Reveal>

          <div
            id="island-themes"
            className="grid grid-cols-4 gap-2 sm:gap-3"
          >
            {islandCards.map((item, index) => (
              <Reveal
                key={item.title}
                delay={index * 80}
              >
                <div className="group relative aspect-[2/3.2] overflow-hidden rounded-2xl border border-white/20">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />

                  <span className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-medium text-white sm:text-sm">
                    {item.title}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          FOOTER
      ========================================== */}

      <footer className="border-t border-urumaya-gold/20 bg-urumaya-forest px-6 py-10 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-9 lg:flex-row lg:items-center">
          <UrumayaLogo />

          <nav className="flex flex-wrap gap-6 text-xs text-white/85">
            <a
              href="#explore"
              className="hover:text-urumaya-gold"
            >
              Explore
            </a>

            <Link
              to="/shop"
              className="hover:text-urumaya-gold"
            >
              Shop
            </Link>

            <a
              href="#stories"
              className="hover:text-urumaya-gold"
            >
              Our Stories
            </a>
          </nav>

          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-white">
              Join Our Journey
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                // Newsletter integration will be added later.
              }}
              className="flex items-center rounded-full border border-white/25 bg-white/5 p-1"
            >
              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Your email address"
                aria-label="Newsletter email address"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs text-white outline-none placeholder:text-white/60"
              />

              <button
                type="submit"
                disabled
                title="Newsletter subscriptions coming soon"
                className="rounded-full bg-urumaya-gold px-3 py-2 text-urumaya-forest opacity-60"
              >
                →
              </button>
            </form>
          </div>
        </div>
      </footer>
    </main>
  );
}
