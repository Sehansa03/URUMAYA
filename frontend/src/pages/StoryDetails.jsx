import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  Copy,
  Check,
  Loader2,
  MapPin,
  Share2,
} from "lucide-react";

import { getStoryBySlug } from "../api/stories";
import "../styles/StoryDetails.css";

/* =========================================
   HELPERS
========================================= */

const titleCase = (value) =>
  String(value?.name || value?.slug || value || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const imageUrl = (value) =>
  typeof value === "string"
    ? value
    : value?.url || value?.secure_url || "";

const dateLabel = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : "";

const priceLabel = (product) => {
  const price = Number(product.price);

  return `${product.currency || "LKR"} ${
    Number.isFinite(price)
      ? price.toLocaleString("en-LK")
      : product.price || ""
  }`;
};

/* =========================================
   LOTUS DECORATION
========================================= */

function Lotus({ className = "" }) {
  return (
    <svg
      viewBox="0 0 80 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M40 49C25 37 27 18 40 5C53 18 55 37 40 49Z" />
      <path d="M40 49C20 48 10 32 12 17C29 18 40 31 40 49Z" />
      <path d="M40 49C60 48 70 32 68 17C51 18 40 31 40 49Z" />
      <path d="M40 49C22 58 8 47 3 32C21 28 33 37 40 49Z" />
      <path d="M40 49C58 58 72 47 77 32C59 28 47 37 40 49Z" />
      <path d="M40 49V57" />
    </svg>
  );
}

function LotusDivider() {
  return (
    <div className="sd-lotus-divider" aria-hidden="true">
      <span />
      <Lotus />
      <span />
    </div>
  );
}

/* =========================================
   PRODUCT DETAILS BOTANICAL DESIGN
========================================= */

function Botanical({ className = "" }) {
  return (
    <svg
      viewBox="0 0 200 310"
      className={`sd-botanical ${className}`}
      aria-hidden="true"
    >
      <g fill="currentColor">
        <path
          d="M15 302C32 210 76 103 168 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />

        <path d="M29 252C2 234 -4 196 8 174C32 198 43 222 29 252Z" />
        <path d="M30 251C69 221 103 231 133 251C92 270 58 268 30 251Z" />

        <path d="M48 201C14 175 15 139 25 114C51 139 64 171 48 201Z" />
        <path d="M50 198C86 165 126 174 159 194C118 217 83 217 50 198Z" />

        <path d="M75 149C43 122 47 84 62 61C88 89 91 119 75 149Z" />
        <path d="M77 147C113 115 150 120 183 137C145 161 109 165 77 147Z" />

        <path d="M108 97C88 64 97 33 119 13C134 46 129 76 108 97Z" />
        <path d="M111 94C143 65 173 68 197 78C172 103 141 112 111 94Z" />

        <path d="M150 30C139 12 153 2 174 0C176 15 166 25 150 30Z" />
      </g>
    </svg>
  );
}

/* =========================================
   IMAGE COMPONENT
========================================= */

function Picture({
  src,
  alt,
  className = "",
  eager = false,
}) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  return src && !broken ? (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      onError={() => setBroken(true)}
      className={`sd-picture ${className}`}
    />
  ) : (
    <div className="sd-image-placeholder">
      <BookOpen size={38} strokeWidth={1.2} />
      <span>Rooted in Heritage</span>
    </div>
  );
}

/* =========================================
   RELATED PRODUCT CARD
========================================= */

function RelatedProductCard({ product }) {
  return (
    <Link
      to={`/shop/${product.slug}`}
      className="sd-product-card"
    >
      <div className="sd-product-image">
        <Picture
          src={imageUrl(product.images?.[0])}
          alt={product.name}
        />

        {product.isFeatured && (
          <span className="sd-featured-badge">
            Artisan Pick
          </span>
        )}

        {product.stockQuantity != null &&
          product.stockQuantity <= 0 && (
            <span className="sd-sold-out">
              Sold Out
            </span>
          )}

        <span className="sd-card-arrow">
          <ArrowUpRight size={18} />
        </span>
      </div>

      <div className="sd-product-content">
        {product.category && (
          <p className="sd-eyebrow">
            {titleCase(product.category)}
          </p>
        )}

        <h3>{product.name}</h3>

        <div className="sd-product-bottom">
          <strong>{priceLabel(product)}</strong>

          {product.originDistrict && (
            <span>
              <MapPin size={12} />
              {product.originDistrict}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* =========================================
   MAIN STORY DETAILS PAGE
========================================= */

export default function StoryDetails() {
  const { slug } = useParams();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState("");

  /* Load story */

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setStory(null);
    setCopied(false);
    setShareError("");

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });

    getStoryBySlug(slug)
      .then((response) => {
        if (active) {
          setStory(response.data || null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err?.response?.data?.message ||
              "We couldn't load this story."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  /* Story paragraphs */

  const paragraphs = useMemo(
    () =>
      String(story?.content || "")
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    [story?.content]
  );

  /* Related products */

  const products = useMemo(
    () =>
      Array.isArray(story?.relatedProducts)
        ? story.relatedProducts.filter(
            (product) =>
              product &&
              typeof product === "object" &&
              product.slug
          )
        : [],
    [story?.relatedProducts]
  );

  /* Story gallery */

  const gallery = useMemo(
    () =>
      Array.isArray(story?.images)
        ? story.images.map(imageUrl).filter(Boolean)
        : [],
    [story?.images]
  );

  const minutes = Math.max(
    1,
    Math.ceil(
      String(story?.content || "")
        .split(/\s+/)
        .filter(Boolean).length / 200
    )
  );

  /* Copy link */

  const copyLink = async () => {
    setShareError("");

    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      setCopied(true);
    } catch {
      setCopied(false);
      setShareError(
        "Unable to copy the link. You can copy it from your address bar."
      );
    }
  };

  /* Share story */

  const share = async () => {
    setShareError("");

    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          await copyLink();
        }
      }
    } else {
      await copyLink();
    }
  };

  /* =========================================
     LOADING STATE
  ========================================= */

  if (loading || (story?.slug && story.slug !== slug)) {
    return (
      <main className="urumaya-story-details sd-page-state">
        <Lotus className="sd-state-lotus" />

        <Loader2 size={24} className="sd-spinner" />

        <p role="status">Opening the story...</p>
      </main>
    );
  }

  /* =========================================
     ERROR STATE
  ========================================= */

  if (error || !story) {
    return (
      <main className="urumaya-story-details sd-page-state">
        <Lotus className="sd-state-lotus" />

        <h1>Story Unavailable</h1>

        <p role="alert">
          {error || "This story is not available."}
        </p>

        <Link to="/stories" className="sd-primary-button">
          <ArrowLeft size={16} />
          Back to Our Stories
        </Link>
      </main>
    );
  }

  /* =========================================
     PAGE CONTENT
  ========================================= */

  return (
    <main className="urumaya-story-details">
      {/* =====================================
          HERO SECTION
      ===================================== */}

      <section className="sd-hero">
        <div className="sd-hero-image">
          <Picture
            src={
              imageUrl(story.coverImage) ||
              gallery[0]
            }
            alt={story.title}
            eager
          />
        </div>

        <div className="sd-hero-overlay" />

        <div className="sd-hero-inner">
          <Link
            to="/stories"
            className="sd-back-link"
          >
            <ArrowLeft size={16} />
            Back to the Journal
          </Link>

          <p className="sd-hero-category">
            OUR STORIES / {titleCase(story.category)}
          </p>

          <h1>{story.title}</h1>

          {story.excerpt && (
            <p className="sd-hero-description">
              {story.excerpt}
            </p>
          )}

          <div className="sd-hero-divider" />
        </div>
      </section>

      {/* =====================================
          ARTICLE SECTION
      ===================================== */}

      <section className="sd-main-section">
        <Botanical className="sd-main-leaf-left" />
        <Botanical className="sd-main-leaf-right" />

        <div className="sd-container">
          {/* Breadcrumb and sharing */}

          <div className="sd-navigation">
            <nav
              className="sd-breadcrumb"
              aria-label="Breadcrumb"
            >
              <Link to="/">Home</Link>

              <ChevronRight size={12} />

              <Link to="/stories">Our Stories</Link>

              <ChevronRight size={12} />

              <span aria-current="page">
                {story.title}
              </span>
            </nav>

            <div className="sd-share-actions">
              <button type="button" onClick={share}>
                <Share2 size={16} />
                Share
              </button>

              <button type="button" onClick={copyLink}>
                {copied ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}

                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>

          {shareError && (
            <p className="sd-share-error" role="status">
              {shareError}
            </p>
          )}

          <div className="sd-article-grid">
            {/* =================================
                STORY ARTICLE
            ================================= */}

            <article className="sd-article">
              <div className="sd-article-meta">
                <span>
                  {titleCase(story.category)}
                </span>

                {story.createdAt && (
                  <span>
                    <CalendarDays size={15} />
                    {dateLabel(story.createdAt)}
                  </span>
                )}

                <span>
                  <Clock3 size={15} />
                  {minutes} min read
                </span>
              </div>

              <h2>{story.title}</h2>

              <div className="sd-article-line" />

              <div className="sd-article-content">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={
                      index === 0
                        ? "sd-intro-paragraph"
                        : ""
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {gallery.length > 0 && (
                <div
                  className={`sd-gallery ${
                    gallery.length > 1
                      ? "sd-gallery-multiple"
                      : ""
                  }`}
                >
                  {gallery.map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="sd-gallery-image"
                    >
                      <Picture
                        src={src}
                        alt={`${story.title}, detail ${
                          index + 1
                        }`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </article>

            {/* =================================
                ARTISAN PROFILE
            ================================= */}

            <aside className="sd-sidebar">
              <div className="sd-artisan-card">
                <p className="sd-eyebrow">
                  Artisan Profile
                </p>

                <div className="sd-small-divider" />

                <div className="sd-artisan-profile">
                  <div className="sd-artisan-icon">
                    <BookOpen
                      size={26}
                      strokeWidth={1.3}
                    />
                  </div>

                  <div>
                    <h3>
                      {story.artisanName ||
                        "The hands behind the craft"}
                    </h3>

                    {story.originDistrict && (
                      <p className="sd-artisan-location">
                        <MapPin size={13} />

                        {story.originDistrict}, Sri Lanka
                      </p>
                    )}
                  </div>
                </div>

                <p className="sd-artisan-description">
                  A story of the skill, patience and
                  traditions that keep Sri Lankan
                  heritage alive.
                </p>

                <div className="sd-sidebar-divider" />

                <p className="sd-eyebrow">
                  Story Details
                </p>

                <div className="sd-detail-list">
                  <div className="sd-detail-item">
                    <span className="sd-detail-icon">
                      <BookOpen size={18} />
                    </span>

                    <div>
                      <p>Craft category</p>

                      <strong>
                        {titleCase(story.category)}
                      </strong>
                    </div>
                  </div>

                  {story.originDistrict && (
                    <div className="sd-detail-item">
                      <span className="sd-detail-icon">
                        <MapPin size={18} />
                      </span>

                      <div>
                        <p>Origin</p>

                        <strong>
                          {story.originDistrict}
                        </strong>
                      </div>
                    </div>
                  )}

                  {story.createdAt && (
                    <div className="sd-detail-item">
                      <span className="sd-detail-icon">
                        <CalendarDays size={18} />
                      </span>

                      <div>
                        <p>Published story</p>

                        <strong>
                          {dateLabel(story.createdAt)}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="sd-sidebar-lotus">
                  <Lotus />

                  <span>Rooted in Heritage</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* =====================================
          RELATED CREATIONS
      ===================================== */}

      {products.length > 0 && (
        <section className="sd-related-section">
          <Botanical className="sd-related-leaf-left" />
          <Botanical className="sd-related-leaf-right" />

          <div className="sd-container">
            <div className="sd-section-heading">
              <LotusDivider />

              <p className="sd-eyebrow">
                Shop the Story
              </p>

              <h2>Related Creations</h2>

              <p className="sd-section-description">
                Discover handcrafted creations connected
                to the traditions you've just explored.
              </p>
            </div>

            <div className="sd-product-grid">
              {products.map((product) => (
                <RelatedProductCard
                  key={product._id || product.slug}
                  product={product}
                />
              ))}
            </div>

            <div className="sd-explore-collection">
              <Link
                to="/shop"
                className="sd-outline-button"
              >
                Explore All Crafts
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* =====================================
          BOTTOM HERITAGE SECTION
      ===================================== */}

      <section className="sd-heritage-cta">
        <Botanical className="sd-cta-leaf-left" />
        <Botanical className="sd-cta-leaf-right" />

        <div className="sd-cta-content">
          <LotusDivider />

          <p className="sd-eyebrow">
            The Journey Continues
          </p>

          <h2>Every craft has another story.</h2>

          <p className="sd-section-description">
            Discover the people, traditions and timeless
            craftsmanship behind Sri Lanka's living
            heritage.
          </p>

          <Link
            to="/stories"
            className="sd-primary-button"
          >
            Explore More Stories
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}