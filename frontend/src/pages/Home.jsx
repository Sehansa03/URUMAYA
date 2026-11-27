import SlowLoadingNotice from "../components/SlowLoadingNotice";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  HandHeart,
  Heart,
  Sparkles,
  Gift,
  ImageOff,
} from "lucide-react";

import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";
import BotanicalDecor from "../components/BotanicalDecor";

import "../styles/Home.css";

const IMAGE_PATH = "/images/home/";

const slides = [
  {
    image: `${IMAGE_PATH}hero-heritage.webp`,
    eyebrow: "THE URUMAYA EDIT",
    title: ["Heritage,", "reimagined."],
    description:
      "Discover timeless Sri Lankan craftsmanship, thoughtfully curated for contemporary living.",
    button: "Shop the Collection",
    link: "/shop",
    position: "center",
  },
  {
    image: `${IMAGE_PATH}hero-jewellery.webp`,
    eyebrow: "ADORNED IN HERITAGE",
    title: ["Elegance,", "handcrafted."],
    description:
      "Discover intricate jewellery inspired by the timeless beauty and artistry of Sri Lanka.",
    button: "Discover the Collection",
    link: "/shop",
    position: "right center",
  },
  {
    image: `${IMAGE_PATH}hero-artisans.webp`,
    eyebrow: "MADE BY HAND, MADE WITH HEART",
    title: ["Every craft,", "a story."],
    description:
      "Celebrate the hands, traditions and generations behind the treasures of our island.",
    button: "Meet the Makers",
    link: "/stories",
    position: "right center",
  },
  {
    image: `${IMAGE_PATH}hero-lace.webp`,
    eyebrow: "THREADS OF TRADITION",
    title: ["Woven with", "memories."],
    description:
      "Explore the delicate artistry and enduring traditions passed from one generation to another.",
    button: "Explore Our Stories",
    link: "/stories",
    position: "center",
  },
];

const benefits = [
  {
    icon: HandHeart,
    title: "Crafted with care",
    description: "Traditional skills and quality",
  },
  {
    icon: Heart,
    title: "Support local artisans",
    description: "Empowering Sri Lankan creators",
  },
  {
    icon: Sparkles,
    title: "Distinctive by design",
    description: "Heritage for modern living",
  },
  {
    icon: Gift,
    title: "Give with meaning",
    description: "Meaningful gifts for loved ones",
  },
];

const collectionOrder = [
  /pottery|ceramic|clay/i,
  /textile|weav|handloom|batik/i,
  /wood|carving/i,
  /brass|metal/i,
];

function extractItems(response, key) {
  const candidates = [
    response?.data?.[key],
    response?.[key],
    response?.data?.items,
    response?.data,
    response?.items,
    response,
  ];

  return candidates.find(Array.isArray) || [];
}

function getImage(item) {
  const image =
    item?.coverImage ||
    item?.imageUrl ||
    item?.image ||
    item?.images?.[0];

  if (typeof image === "string") return image;

  return image?.url || image?.secure_url || "";
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(price || 0));
}

function CraftImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className={`uh-image-placeholder ${className}`}>
        <ImageOff size={26} strokeWidth={1.2} />
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function SectionLabel({ children }) {
  return <p className="uh-eyebrow">{children}</p>;
}

function ActionLink({
  to,
  children,
  variant = "green",
}) {
  return (
    <Link
      to={to}
      className={`uh-button uh-button-${variant}`}
    >
      {children}
      <ArrowUpRight size={16} strokeWidth={1.7} />
    </Link>
  );
}

function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const [reducedMotion, setReducedMotion] = useState(
    () =>
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
  );

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const handleChange = (event) =>
      setReducedMotion(event.matches);

    media.addEventListener("change", handleChange);

    return () =>
      media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;

    const interval = window.setInterval(() => {
      setActive((previous) =>
        (previous + 1) % slides.length
      );
    }, 6500);

    return () => window.clearInterval(interval);
  }, [active, paused, reducedMotion]);

  const slide = slides[active];

  return (
    <section
      className="uh-hero"
      aria-label="Discover URUMAYA"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <div className="uh-hero-images">
        {slides.map((item, index) => (
          <img
            key={item.image}
            src={item.image}
            alt=""
            aria-hidden="true"
            className={`uh-hero-photo ${
              index === active ? "is-active" : ""
            }`}
            style={{ objectPosition: item.position }}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        ))}
      </div>

      <div className="uh-hero-light" />

      <div className="uh-hero-glass" />

      <BotanicalDecor className="uh-hero-leaves" />

      <div className="uh-container uh-hero-inner">
        <div className="uh-hero-copy">
          <div key={active} className="uh-slide-copy">
            <SectionLabel>{slide.eyebrow}</SectionLabel>

            <h1>
              {slide.title.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>

            <p className="uh-hero-description">
              {slide.description}
            </p>

            <ActionLink
              to={slide.link}
              variant="terracotta"
            >
              {slide.button}
            </ActionLink>
          </div>

          <div
            className="uh-hero-dots"
            aria-label="Choose hero slide"
          >
            {slides.map((item, index) => (
              <button
                key={item.image}
                type="button"
                className={
                  index === active ? "is-active" : ""
                }
                onClick={() => setActive(index)}
                aria-label={`Show slide ${index + 1}`}
                aria-pressed={index === active}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section
      className="uh-container uh-benefits-wrapper"
      aria-label="Why shop with URUMAYA"
    >
      <div className="uh-benefits">
        {benefits.map(
          ({ icon: Icon, title, description }) => (
            <div className="uh-benefit" key={title}>
              <div className="uh-benefit-icon">
                <Icon size={29} strokeWidth={1.3} />
              </div>

              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

function Collections({ categories, loading, error, onRetry }) {
  const ordered = [];

  collectionOrder.forEach((pattern) => {
    const match = categories.find(
      (category) =>
        pattern.test(category.name || "") &&
        !ordered.includes(category)
    );

    if (match) ordered.push(match);
  });

  categories.forEach((category) => {
    if (!ordered.includes(category)) {
      ordered.push(category);
    }
  });

  const collections = ordered.slice(0, 4);

  return (
    <section className="uh-container uh-collections">
      <div className="uh-collections-copy">
        <SectionLabel>CURATED COLLECTIONS</SectionLabel>

        <h2>Find your Treasure.</h2>

        <p>
          Explore distinctive collections inspired by
          the living traditions of Sri Lanka.
        </p>

        <ActionLink to="/shop" variant="outline">
          View All Collections
        </ActionLink>
      </div>

      {loading ? (
        <div className="uh-collection-grid">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className={`uh-skeleton uh-collection-${item}`}
            />
          ))}
        </div>
      ) : collections.length ? (
        <div
          className={`uh-collection-grid ${
            collections.length < 4 ? "uh-grid-simple" : ""
          }`}
        >
          {collections.map((category, index) => (
            <Link
              key={category._id || category.slug}
              to={`/shop?category=${encodeURIComponent(
                category.slug || category.name
              )}`}
              className={`uh-collection-card uh-collection-${index}`}
            >
              <CraftImage
                src={getImage(category)}
                alt={category.name}
              />

              <div className="uh-collection-shade" />

              <div className="uh-collection-name">
                <h3>{category.name}</h3>
                <span />
              </div>

              <div className="uh-collection-arrow">
                <ArrowUpRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="uh-empty">
          {error
            ? "Unable to load collections right now."
            : "Our collections are coming soon."}
          {error && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="cursor-pointer rounded-full bg-[#123E32] px-6 py-3 text-sm font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function FeaturedProducts({ products, loading, error, onRetry }) {
  const featured = products.filter(
    (product) => product.isFeatured
  );

  const others = products.filter(
    (product) => !product.isFeatured
  );

  const displayed = [...featured, ...others].slice(0, 4);

  return (
    <section className="uh-container uh-featured">
      <div className="uh-section-heading">
        <div>
          <SectionLabel>HANDPICKED FOR YOU</SectionLabel>
          <h2>Objects with Meaning.</h2>
        </div>

        <p>Discover craftsmanship worth bringing home.</p>
      </div>

      {loading ? (
        <div className="uh-product-grid">
          {[0, 1, 2, 3].map((item) => (
            <div
              className="uh-skeleton uh-product-skeleton"
              key={item}
            />
          ))}
        </div>
      ) : displayed.length ? (
        <div className="uh-product-grid">
          {displayed.map((product) => (
            <Link
              to={`/shop/${encodeURIComponent(product.slug)}`}
              key={product._id || product.slug}
              className="uh-product-card"
            >
              <div className="uh-product-image">
                <CraftImage
                  src={getImage(product)}
                  alt={product.name}
                />

                <span className="uh-product-view">
                  <ArrowUpRight size={17} />
                </span>
              </div>

              <div className="uh-product-information">
                <h3>{product.name}</h3>

                <p className="uh-product-price">
                  LKR {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="uh-empty">
          {error
            ? "Unable to load products right now."
            : "Beautiful new treasures are coming soon."}
          {error && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="cursor-pointer rounded-full bg-[#123E32] px-6 py-3 text-sm font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      <div className="uh-centered-action">
        <span />
        <ActionLink to="/shop">
          Explore All Products
        </ActionLink>
        <span />
      </div>
    </section>
  );
}

function MeetTheMakers() {
  return (
    <section className="uh-container uh-makers-section">
      <div className="uh-makers">
        <div className="uh-makers-image">
          <CraftImage
            src={`${IMAGE_PATH}hero-lace.webp`}
            alt="Sri Lankan artisan creating traditional handmade lace"
          />
        </div>

        <div className="uh-makers-copy">
          <SectionLabel>BEHIND THE CRAFT</SectionLabel>

          <h2>Meet the Makers.</h2>

          <p>
            Real stories of artisans who keep
            Sri Lankan traditions alive.
          </p>

          <ActionLink to="/stories">
            Explore Our Stories
          </ActionLink>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [errors, setErrors] = useState({
    products: false,
    categories: false,
  });

  useEffect(() => {
    let mounted = true;

    async function loadHomepage() {
      setLoading(true);
      const [productResult, categoryResult] =
        await Promise.allSettled([
          getProducts({ limit: 12 }),
          getCategories(),
        ]);

      if (!mounted) return;

      if (productResult.status === "fulfilled") {
        setProducts(
          extractItems(productResult.value, "products")
        );
      }

      if (categoryResult.status === "fulfilled") {
        setCategories(
          extractItems(categoryResult.value, "categories")
        );
      }

      setErrors({
        products: productResult.status === "rejected",
        categories: categoryResult.status === "rejected",
      });

      setLoading(false);
    }

    loadHomepage();

    return () => {
      mounted = false;
    };
  }, [retryKey]);

  return (
    <main className="uh-home">
      <Hero />

      <div className="uh-home-body">
        <div className="uh-sunlight uh-sunlight-one" />
        <div className="uh-sunlight uh-sunlight-two" />

        <BotanicalDecor
          className="uh-leaves-right-top"
        />

        <BotanicalDecor
          className="uh-outline-left"
          outline
        />

        <BotanicalDecor
          className="uh-leaves-right-middle"
        />

        <BotanicalDecor
          className="uh-leaves-left-bottom"
        />

        <BotanicalDecor
          className="uh-leaves-right-bottom"
        />

        <Benefits />
        <SlowLoadingNotice loading={loading} />

        <Collections
          categories={categories}
          loading={loading}
          error={errors.categories}
          onRetry={() => setRetryKey((key) => key + 1)}
        />

        <FeaturedProducts
          products={products}
          loading={loading}
          error={errors.products}
          onRetry={() => setRetryKey((key) => key + 1)}
        />

        <MeetTheMakers />
      </div>
    </main>
  );
}
