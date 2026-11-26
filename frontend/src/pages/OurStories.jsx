import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

import { getStories } from "../api/stories";
import { getCategories } from "../api/categories";

import "../styles/OurStories.css";

const HERO_IMAGE = "/images/urumaya-stories-hero.webp";
const PAGE_SIZE = 12;

function Lotus({ className = "" }) {
  return (
    <svg
      viewBox="0 0 80 60"
      fill="none"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
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



function getImageUrl(value) {
  if (typeof value === "string") return value;

  return value?.secure_url || value?.url || "";
}
function Botanical({ className = "" }) {
  return (
    <svg
      viewBox="0 0 180 260"
      aria-hidden="true"
      className={className}
    >
      <g
        fill="#89965A"
        className="us-botanical-motion"
      >
        <path
          d="M28 245C30 160 65 70 130 5"
          fill="none"
          stroke="#89965A"
          strokeWidth="2"
        />

        <path d="M48 166C5 146 2 109 10 83C43 101 59 128 48 166Z" />

        <path d="M53 151C78 110 119 111 156 124C126 155 90 167 53 151Z" />

        <path d="M76 102C43 77 44 38 58 14C84 38 93 70 76 102Z" />

        <path d="M85 88C106 43 143 38 177 45C156 80 125 96 85 88Z" />

        <path d="M32 215C4 193 0 165 5 143C33 160 43 186 32 215Z" />

        <path d="M34 209C65 173 103 180 128 195C94 219 65 225 34 209Z" />
      </g>
    </svg>
  );
}

function getStoryImage(story) {
  return (
    getImageUrl(story?.coverImage) ||
    getImageUrl(story?.images?.[0]) ||
    ""
  );
}

function formatCategory(value) {
  if (value && typeof value === "object") {
    return value.name || formatCategory(value.slug);
  }

  return String(value || "Heritage")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/* ==========================================
   IMAGE COMPONENT
========================================== */

function StoryImage({ story, className = "" }) {
  const src = getStoryImage(story);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {src && !failed ? (
        <img
          src={src}
          alt={story.title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#E9DCC9] via-[#C9B398] to-[#9D866B]">
          <span className="font-display text-xl tracking-[0.2em] text-[#6A5844]/70">
            URUMAYA
          </span>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   SCROLL REVEAL ANIMATION
========================================== */

function Reveal({ children, className = "" }) {
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
      { threshold: 0.08 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-5 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

/* ==========================================
   LARGE FEATURED STORY
========================================== */

function MainFeaturedStory({ story }) {
  if (!story) return null;

  return (
    <Link
      to={`/stories/${story.slug}`}
      className="group relative block h-[420px] overflow-hidden rounded-[24px] shadow-[0_18px_45px_rgba(28,34,27,0.14)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_55px_rgba(28,34,27,0.22)] lg:h-[450px]"
    >
      <StoryImage
        story={story}
        className="absolute inset-0 h-full w-full"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#071A15]/95 via-[#071A15]/30 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-9">
        <span className="inline-flex rounded-full border border-white/40 bg-white/15 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md">
          {formatCategory(story.category)}
        </span>

        <h3 className="mt-4 max-w-lg font-display text-3xl leading-[1.1] sm:text-4xl">
          {story.title}
        </h3>

        {story.excerpt && (
          <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-6 text-white/85">
            {story.excerpt}
          </p>
        )}

        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#F0C58B]">
          Read the Story
          <ArrowRight
            size={17}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

/* ==========================================
   SIDE FEATURED STORY
========================================== */

function SideFeaturedStory({ story }) {
  if (!story) return null;

  return (
    <Link
      to={`/stories/${story.slug}`}
      className="group grid h-[200px] grid-cols-[46%_54%] overflow-hidden rounded-[22px] border border-[#E8DDCF] bg-[#FAF1E2] shadow-[0_5px_16px_rgba(83,60,28,0.07)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(45,38,31,0.14)] lg:h-[215px]"
    >
      <StoryImage story={story} className="h-full w-full" />

      <div className="flex min-w-0 flex-col justify-center p-4 sm:p-6">
        <span className="w-fit rounded-full border border-[#E8C9B5] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#B95035]">
          {formatCategory(story.category)}
        </span>

        <h3 className="mt-3 line-clamp-3 font-display text-lg leading-[1.14] text-[#103B34] sm:text-2xl">
          {story.title}
        </h3>

        <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#B95035]">
          Read the Story
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

/* ==========================================
   LATEST STORY CARD
========================================== */

function LatestStoryCard({ story }) {
  return (
    <Link
      to={`/stories/${story.slug}`}
      className="group us-story-card"
    >
      <StoryImage story={story} className="us-story-image" />

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#B95035]">
          {formatCategory(story.category)}
        </span>

        <h3 className="mt-3 line-clamp-2 font-display text-[25px] leading-[1.15] text-[#103B34]">
          {story.title}
        </h3>

        {story.excerpt && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#77756F]">
            {story.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-xs font-semibold text-[#B95035]">
            Discover the Story
          </span>

          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7D8C5] bg-[#F8F2E9] text-[#103B34] transition-colors group-hover:bg-[#B95035] group-hover:text-white">
            <ArrowUpRight size={17} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ==========================================
   MAIN PAGE
========================================== */

export default function OurStories() {
  const [categories, setCategories] = useState([]);
  const [stories, setStories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const collectionRef = useRef(null);

  /* Load categories dynamically */
  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const response = await getCategories();

        if (active) {
          setCategories(
            Array.isArray(response.data) ? response.data : []
          );
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  /* Load stories */
  useEffect(() => {
    let active = true;

    async function loadStories() {
      setLoading(true);
      setError("");

      try {
        const response = await getStories({
          page,
          limit: PAGE_SIZE,
          ...(selectedCategory !== "all"
            ? { category: selectedCategory }
            : {}),
          ...(search.trim()
            ? { search: search.trim() }
            : {}),
        });

        if (!active) return;

        setStories(
          Array.isArray(response.data) ? response.data : []
        );

        setTotalPages(
          Math.max(1, response.pagination?.totalPages || 1)
        );
      } catch (err) {
        if (active) {
          setError("Unable to load stories. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    const timer = setTimeout(
      loadStories,
      search.trim() ? 300 : 0
    );

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selectedCategory, search, page, retry]);

  const defaultView =
    selectedCategory === "all" &&
    !search.trim() &&
    page === 1;

  /* Pick three featured stories */
  const featured = useMemo(() => {
    if (!defaultView) return [];

    const sorted = [
      ...stories.filter((story) => story.isFeatured),
      ...stories.filter((story) => !story.isFeatured),
    ];

    const firstWithImage = sorted.findIndex((story) =>
      getStoryImage(story)
    );

    if (firstWithImage > 0) {
      const [imageStory] = sorted.splice(firstWithImage, 1);
      sorted.unshift(imageStory);
    }

    return sorted.slice(0, 3);
  }, [stories, defaultView]);

  /* All other stories */
  const latest = useMemo(() => {
    if (!defaultView) return stories;

    const featuredIds = new Set(
      featured.map((story) => story._id)
    );

    return stories.filter(
      (story) => !featuredIds.has(story._id)
    );
  }, [stories, featured, defaultView]);

  function scrollToStories() {
    collectionRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }

  function selectCategory(slug) {
    setSelectedCategory(slug);
    setPage(1);
    scrollToStories();
  }

  function changePage(next) {
    setPage(next);
    scrollToStories();
  }

  return (
    <main className="urumaya-stories">
      <section className="us-hero" aria-label="URUMAYA heritage journal">
        <img className="us-hero-photo" src={HERO_IMAGE} alt="Sri Lankan culture, traditional crafts and heritage" fetchPriority="high" />
        <div className="us-hero-light" />
        <div className="us-hero-glass" />
        <Botanical className="us-hero-leaves" />
        <div className="us-hero-inner">
          <div className="us-hero-copy">
            <p className="us-eyebrow">URUMAYA / HERITAGE JOURNAL</p>
            <h1>Stories of Craft,<br />Culture and People.</h1>
            <p className="us-hero-description">Explore the living heritage of Sri Lanka — the skilled hands, inspiring lives and timeless traditions behind every meaningful creation.</p>
            <button type="button" className="us-button" onClick={scrollToStories}>Explore the Stories <ArrowUpRight size={17} /></button>
          </div>
        </div>
      </section>
      <div className="us-journal">
        <Botanical className="us-leaves us-leaves-left" />
        <Botanical className="us-leaves us-leaves-right" />
        <section className="us-filter-section" ref={collectionRef}>
          <div className="us-lotus-divider" aria-hidden="true"><span /><Lotus /><span /></div>
          <nav className="us-categories" aria-label="Story categories">
            {[{ slug: "all", name: "All Stories" }, ...categories].map((category) => (
              <button key={category.slug} type="button" aria-pressed={selectedCategory === category.slug} className="us-category" onClick={() => selectCategory(category.slug)}>{category.name || formatCategory(category.slug)}</button>
            ))}
          </nav>
        </section>

        {/* ==================================
            STORIES JOURNAL
        ================================== */}
        <section
          className="us-collection"
        >
          {/* Journal heading */}
          <Reveal>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <p className="us-results" aria-live="polite">{loading ? "Finding your stories..." : error ? "Journal unavailable" : `${stories.length} ${stories.length === 1 ? "story" : "stories"} on this page`}</p>

              {/* Search */}
              <div className="us-search">
                <Search size={18} className="text-[#8D8C83]" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search heritage stories..."
                  aria-label="Search heritage stories"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#103B34] outline-none placeholder:text-[#99968E]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </Reveal>

          {/* Loading state */}
          {loading && (
            <div className="mt-9 grid gap-5 lg:grid-cols-2">
              <div className="h-[450px] animate-pulse rounded-[24px] bg-[#E8DDCF]" />

              <div className="grid gap-5">
                <div className="h-[215px] animate-pulse rounded-[22px] bg-[#E8DDCF]" />
                <div className="h-[215px] animate-pulse rounded-[22px] bg-[#E8DDCF]" />
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="mt-9 rounded-3xl border border-[#E5D9CB] bg-[#F8F2E9] px-8 py-12 text-center">
              <p className="text-[#B95035]">{error}</p>

              <button
                type="button"
                onClick={() => setRetry((n) => n + 1)}
                className="mt-5 rounded-full bg-[#103B34] px-7 py-3 text-sm text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && stories.length === 0 && (
            <div className="mt-9 rounded-3xl border border-[#E5D9CB] bg-[#F8F2E9] px-8 py-12 text-center">
              <h3 className="font-display text-3xl text-[#103B34]">
                No stories found
              </h3>

              <p className="mt-3 text-sm text-[#77756F]">
                Try another category or search term.
              </p>
            </div>
          )}

          {/* ==================================
              FEATURED STORIES
          ================================== */}
          {!loading &&
            !error &&
            defaultView &&
            featured.length > 0 && (
              <div className="mt-9">
                <Reveal>
                  <div className="mb-6 flex items-center gap-5">
                    <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B95035]">
                      FEATURED STORIES
                    </span>

                    <div className="h-px flex-1 bg-[#E4D6C5]" />
                  </div>
                </Reveal>

                <div className={`grid gap-5 ${featured.length > 1 ? "lg:grid-cols-2" : ""}`}>
                  <Reveal>
                    <MainFeaturedStory story={featured[0]} />
                  </Reveal>

                  {featured.length > 1 && (
                    <div className="grid gap-5">
                      {featured.slice(1, 3).map((story) => (
                        <Reveal key={story._id}>
                          <SideFeaturedStory story={story} />
                        </Reveal>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* ==================================
              REMAINING STORIES
          ================================== */}
          {!loading && !error && latest.length > 0 && (
            <div className={defaultView ? "mt-16" : "mt-9"}>
              <Reveal>
                <div className="mb-7 flex items-center gap-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B95035]">
                      EXPLORE THE JOURNAL
                    </p>

                    <h3 className="mt-3 font-display text-3xl text-[#103B34] sm:text-4xl">
                      {defaultView
                        ? "Latest Stories"
                        : selectedCategory === "all"
                          ? "Explore Stories"
                          : formatCategory(
                              categories.find(
                                (category) =>
                                  category.slug ===
                                  selectedCategory
                              )?.name || selectedCategory
                            )}
                    </h3>
                  </div>

                  <div className="h-px flex-1 bg-[#E4D6C5]" />
                </div>
              </Reveal>

              <div className="us-story-grid">
                {latest.map((story) => (
                  <Reveal
                    key={story._id}
                    className="h-full"
                  >
                    <LatestStoryCard story={story} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-5">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
                aria-label="Previous page"
                className="rounded-full border border-[#DFD2C2] bg-white p-3 text-[#103B34] transition hover:bg-[#103B34] hover:text-white disabled:opacity-30"
              >
                <ChevronLeft size={19} />
              </button>

              <span className="text-sm text-[#103B34]">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => changePage(page + 1)}
                aria-label="Next page"
                className="rounded-full border border-[#DFD2C2] bg-white p-3 text-[#103B34] transition hover:bg-[#103B34] hover:text-white disabled:opacity-30"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ==================================
    BOTTOM HERITAGE CTA
================================== */}

<section className="us-heritage-cta">

  <Botanical className="us-cta-leaves us-cta-leaves-left" />
  <Botanical className="us-cta-leaves us-cta-leaves-right" />

  <div className="us-cta-content">

    <div className="us-lotus-divider" aria-hidden="true">
      <span />
      <Lotus />
      <span />
    </div>

    <p className="us-cta-eyebrow">
      ROOTED IN HERITAGE
    </p>

    <h2>
      Every creation carries a story.
    </h2>

    <p className="us-cta-description">
      Explore the craftsmanship and cultural traditions
      behind our collection.
    </p>

    <Link to="/shop" className="us-cta-button">
      Explore the Collection
      <ArrowUpRight size={17} />
    </Link>

  </div>

</section>
    </main>
  );
}
