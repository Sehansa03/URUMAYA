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

const HERO_IMAGE = "/images/urumaya-stories-hero.webp";
const PAGE_SIZE = 12;

function getImageUrl(value) {
  if (typeof value === "string") return value;

  return value?.secure_url || value?.url || "";
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
      className="group grid h-[200px] grid-cols-[46%_54%] overflow-hidden rounded-[22px] border border-[#E8DDCF] bg-white/85 shadow-[0_12px_35px_rgba(45,38,31,0.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(45,38,31,0.14)] lg:h-[215px]"
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
      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[#E8DDCF] bg-white/85 shadow-[0_10px_30px_rgba(45,38,31,0.06)] backdrop-blur-lg transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(45,38,31,0.13)]"
    >
      <StoryImage story={story} className="h-[225px] w-full" />

      <div className="flex flex-1 flex-col p-6">
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
  const categoryRef = useRef(null);

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
      behavior: "smooth",
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
    <main className="min-h-screen overflow-x-hidden bg-[#FFFCF7]">

      {/* ==================================
          HERO SECTION
      ================================== */}
      <section className="relative isolate min-h-[690px] overflow-hidden bg-[#103B34] lg:min-h-[780px]">
        <img
          src={HERO_IMAGE}
          alt="Sri Lankan culture, traditional crafts and heritage"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[30%_center] lg:object-center"
        />

       
{/* Soft overall dark tint */}
<div className="pointer-events-none absolute inset-0 bg-[#061D17]/65 md:bg-[#061D17]/15" />

{/* Darker right side for readable text */}
<div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#08271E]/10 to-[#061F18]/85" />

{/* Dark top and bottom edges */}
<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#061D17]/55 via-transparent to-[#061D17]/65" />

{/* Cinematic vignette around all edges */}
<div
  className="pointer-events-none absolute inset-0"
  style={{
    background:
      "radial-gradient(ellipse at 45% 45%, transparent 30%, rgba(3, 20, 15, 0.22) 65%, rgba(3, 20, 15, 0.75) 100%)",
  }}
/>


        <div className="relative mx-auto flex min-h-[690px] max-w-[1500px] items-end px-6 pb-16 pt-36 sm:px-12 lg:min-h-[780px] lg:items-center lg:justify-end lg:px-20">
          <div className="max-w-[590px] text-white lg:w-[48%]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F1C887]">
              URUMAYA / HERITAGE JOURNAL
            </p>

            <h1 className="mt-7 font-display text-[clamp(3.3rem,5.3vw,5.8rem)] leading-[1.05] tracking-[-0.035em]">
              Stories of
              <br />
              Craft, Culture
              <br />
              <span className="text-[#F0C58B]">
                and People.
              </span>
            </h1>

            <p className="mt-7 max-w-[460px] text-sm leading-8 text-white/85 sm:text-base">
              Explore the living heritage of Sri Lanka —
              the skilled hands, inspiring lives, and timeless
              traditions behind every meaningful creation.
            </p>

            <button
              type="button"
              onClick={() =>
                collectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="mt-8 inline-flex items-center gap-4 rounded-full bg-[#B95035] px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#D26849]"
            >
              Explore the Stories
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ==================================
          JOURNAL CONTENT
      ================================== */}
      <div className="relative overflow-hidden bg-[#FFFCF7]">

        {/* Soft background decorations */}
        <div className="pointer-events-none absolute -right-40 top-28 h-[430px] w-[430px] rounded-full bg-[#EADCC9]/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-[600px] h-[350px] w-[350px] rounded-full bg-[#E8DCCB]/20 blur-3xl" />

        {/* ==================================
            GLASS CATEGORY NAVIGATION
        ================================== */}
        <section className="relative mx-auto max-w-[1450px] px-5 pt-10 sm:px-10">
          <Reveal>
            <div className="rounded-[26px] border border-white/80 bg-[#F7F0E7]/75 px-6 py-7 shadow-[0_18px_55px_rgba(75,55,35,0.10)] backdrop-blur-2xl lg:px-9">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:gap-10">

                <div className="shrink-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B95035]">
                    EXPLORE BY CRAFT
                  </p>

                  <h2 className="mt-2 font-display text-[27px] leading-tight text-[#103B34]">
                    Browse Stories by Craft
                  </h2>
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <button
                    type="button"
                    aria-label="Scroll categories left"
                    onClick={() =>
                      categoryRef.current?.scrollBy({
                        left: -260,
                        behavior: "smooth",
                      })
                    }
                    className="hidden shrink-0 rounded-full border border-[#E4D6C5] bg-white p-2 text-[#103B34] transition hover:bg-[#EFE3D4] sm:flex"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div
                    ref={categoryRef}
                    className="flex min-w-0 flex-1 gap-3 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    <button
                      type="button"
                      onClick={() => selectCategory("all")}
                      className={`shrink-0 rounded-full px-6 py-3 text-sm font-medium transition-all ${
                        selectedCategory === "all"
                          ? "bg-[#103B34] text-white shadow-md"
                          : "border border-[#E2D4C3] bg-white/85 text-[#103B34] hover:border-[#B95035]"
                      }`}
                    >
                      All Stories
                    </button>

                    {categories.map((category) => (
                      <button
                        key={category._id || category.slug}
                        type="button"
                        onClick={() =>
                          selectCategory(category.slug)
                        }
                        className={`shrink-0 rounded-full px-6 py-3 text-sm font-medium transition-all ${
                          selectedCategory === category.slug
                            ? "bg-[#103B34] text-white shadow-md"
                            : "border border-[#E2D4C3] bg-white/85 text-[#103B34] hover:border-[#B95035]"
                        }`}
                      >
                        {category.name ||
                          formatCategory(category.slug)}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    aria-label="Scroll categories right"
                    onClick={() =>
                      categoryRef.current?.scrollBy({
                        left: 260,
                        behavior: "smooth",
                      })
                    }
                    className="hidden shrink-0 rounded-full border border-[#E4D6C5] bg-white p-2 text-[#103B34] transition hover:bg-[#EFE3D4] sm:flex"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ==================================
            STORIES JOURNAL
        ================================== */}
        <section
          ref={collectionRef}
          className="relative mx-auto max-w-[1450px] scroll-mt-28 px-5 pb-20 pt-12 sm:px-10 lg:pt-14"
        >
          {/* Journal heading */}
          <Reveal>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="flex items-center gap-3">
                  

                 
                </div>

                

               
              </div>

              {/* Search */}
              <div className="flex w-full items-center gap-3 rounded-full border border-[#E4D7C8] bg-white/80 px-5 py-3.5 shadow-[0_8px_25px_rgba(45,38,31,0.06)] backdrop-blur-xl md:max-w-[340px]">
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

                <div className="grid gap-5 lg:grid-cols-2">
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

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
      <section className="relative overflow-hidden bg-[#103B34] py-14 text-white">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-[#EBC38A]/15" />

        <div className="relative mx-auto flex max-w-[1250px] flex-col items-start justify-between gap-7 px-6 sm:px-10 md:flex-row md:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#EBC38A]">
              ROOTED IN HERITAGE
            </p>

            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              Every creation carries a story.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
              Explore the craftsmanship and cultural traditions
              behind our collection.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#B95035] px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#D26849]"
          >
            Explore the Collection
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
