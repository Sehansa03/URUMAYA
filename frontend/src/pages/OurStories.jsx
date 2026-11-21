import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search, Loader2, BookOpen, ArrowRight } from "lucide-react";
import { getStories } from "../api/stories";
import { getCategories } from "../api/categories";

const titleCase = (value = "") => value.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "";

function StoryImage({ src, alt, className = "" }) {
  return src ? <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${className}`} /> : <div className="flex h-full w-full items-center justify-center bg-[#214A48] text-[#F6EEDF]/60"><BookOpen size={44} strokeWidth={1} /></div>;
}

export default function OurStories() {
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories().then((res) => setCategories(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getStories({ page, limit: 9, ...(selected !== "all" ? { category: selected } : {}), ...(search.trim() ? { search: search.trim() } : {}) });
        if (!cancelled) {
          setStories(Array.isArray(response.data) ? response.data : []);
          setTotalPages(Math.max(1, response.pagination?.totalPages || 1));
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "We couldn't load the stories. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const timer = setTimeout(load, search ? 300 : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [selected, search, page]);

  const featured = useMemo(() => page === 1 && !search && selected === "all" ? stories.find((story) => story.isFeatured) || stories[0] : null, [stories, page, search, selected]);
  const others = featured ? stories.filter((story) => story._id !== featured._id) : stories;

  return (
    <main className="min-h-screen bg-[#F6EEDF] text-[#103D46]">
      <section className="relative overflow-hidden bg-[#103D46] px-6 pb-20 pt-20 text-[#F6EEDF] md:pb-28 md:pt-28">
        <div className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full border border-[#E6AD51]/20" />
        <div className="pointer-events-none absolute -right-8 top-12 h-72 w-72 rounded-full border border-[#E6AD51]/20" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[#E6AD51]">URUMAYA / The Heritage Journal</p>
          <h1 className="mt-7 max-w-4xl font-display text-6xl leading-[1.08] md:text-8xl">Objects fade.<br /><span className="italic text-[#E6AD51]">Stories endure.</span></h1>
          <div className="mt-9 flex max-w-2xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-lg text-base leading-8 text-[#F6EEDF]/75">Travel through the hands, places and traditions that shape Sri Lanka's living heritage. Every creation has a story worth discovering.</p>
            <a href="#discover-stories" className="inline-flex shrink-0 items-center gap-2 text-sm text-[#E6AD51] hover:text-white">Explore the journal <ArrowRight size={17} /></a>
          </div>
        </div>
      </section>

      {featured && <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="mb-6 flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-[#B95035]"><span>Editor's Selection</span><span className="h-px flex-1 bg-[#103D46]/15" /></div>
        <Link to={`/stories/${featured.slug}`} className="group grid overflow-hidden rounded-2xl bg-white shadow-sm md:grid-cols-[1.2fr_1fr]">
          <div className="h-80 overflow-hidden md:h-[520px]"><StoryImage src={featured.coverImage} alt={featured.title} /></div>
          <div className="flex flex-col justify-center p-8 md:p-14">
            <p className="text-xs uppercase tracking-[0.25em] text-[#B95035]">{titleCase(featured.category)} {featured.originDistrict ? `· ${featured.originDistrict}` : ""}</p>
            <h2 className="mt-6 font-display text-4xl leading-tight md:text-6xl">{featured.title}</h2>
            <p className="mt-6 line-clamp-4 text-sm leading-8 text-[#103D46]/65">{featured.excerpt}</p>
            <span className="mt-9 inline-flex items-center gap-3 text-sm font-medium">Uncover the story <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span>
          </div>
        </Link>
      </section>}

      <section id="discover-stories" className="mx-auto max-w-7xl scroll-mt-28 px-6 pb-24 pt-12">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="text-xs uppercase tracking-[0.3em] text-[#B95035]">Discover / Explore / Remember</p><h2 className="mt-3 font-display text-4xl md:text-5xl">The stories within</h2></div>
          <label className="flex items-center gap-3 rounded-full border border-[#103D46]/20 bg-white px-5 py-3 md:w-80"><Search size={17} /><input aria-label="Search stories" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by story title..." className="w-full bg-transparent text-sm outline-none placeholder:text-[#103D46]/40" /></label>
        </div>
        <div className="mb-10 flex flex-wrap gap-2">
          {[{ slug: "all", name: "All Stories" }, ...categories].map((category) => <button key={category.slug} type="button" onClick={() => { setSelected(category.slug); setPage(1); }} className={`rounded-full border px-5 py-2.5 text-xs transition ${selected === category.slug ? "border-[#103D46] bg-[#103D46] text-white" : "border-[#103D46]/20 text-[#103D46] hover:border-[#103D46]"}`}>{category.name}</button>)}
        </div>
        {loading ? <div className="flex justify-center gap-3 py-24 text-sm"><Loader2 className="animate-spin" /> Gathering stories...</div> : error ? <div role="alert" className="rounded-xl bg-white p-10 text-center text-[#B95035]">{error}<button onClick={() => setPage((p) => p)} className="ml-3 underline">Refresh the page to retry</button></div> : stories.length === 0 ? <div className="rounded-2xl border border-[#103D46]/10 bg-white px-8 py-24 text-center"><BookOpen size={38} className="mx-auto mb-5 opacity-40" /><h3 className="font-display text-3xl">Stories are taking shape</h3><p className="mt-3 text-sm text-[#103D46]/60">Try another search or category, or return when our first stories are published.</p></div> : <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {others.map((story, index) => <Link key={story._id} to={`/stories/${story.slug}`} className={`group block ${index % 3 === 1 ? "lg:mt-12" : ""}`}>
            <div className="aspect-[4/5] overflow-hidden rounded-xl"><StoryImage src={story.coverImage} alt={story.title} /></div>
            <div className="mt-5 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#B95035]"><span>{titleCase(story.category)}</span><span>{formatDate(story.createdAt)}</span></div>
            <h3 className="mt-3 font-display text-3xl leading-tight transition-colors group-hover:text-[#B95035]">{story.title}</h3>
            <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#103D46]/65">{story.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold">Read the story <ArrowUpRight size={15} /></span>
          </Link>)}
        </div>}
        {!loading && !error && totalPages > 1 && <div className="mt-16 flex items-center justify-center gap-4"><button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-full border border-[#103D46]/30 px-5 py-2 text-sm disabled:opacity-30">Previous</button><span className="text-xs">{page} / {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-full border border-[#103D46]/30 px-5 py-2 text-sm disabled:opacity-30">Next</button></div>}
      </section>
      <footer className="bg-[#103D46] px-6 py-12 text-center text-[#F6EEDF]"><p className="font-display text-3xl">URUMAYA</p><p className="mt-2 text-xs uppercase tracking-[0.3em] text-[#E6AD51]">Rooted in Heritage</p></footer>
    </main>
  );
}
