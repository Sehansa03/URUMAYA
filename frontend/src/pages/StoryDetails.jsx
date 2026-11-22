import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, CalendarDays, ChevronRight, Clock3, Copy, Loader2, MapPin, Share2, ShoppingBag } from "lucide-react";
import { getStoryBySlug } from "../api/stories";

const titleCase = s => String(s || "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const imageUrl = v => typeof v === "string" ? v : v?.url || v?.secure_url || "";
const dateLabel = d => d ? new Date(d).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "";
const priceLabel = (p) => { const n = Number(p.price); return `${p.currency || "LKR"} ${Number.isFinite(n) ? n.toLocaleString("en-LK") : p.price || ""}`; };

function Picture({ src, alt, className = "" }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return src && !broken ? <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} className={`h-full w-full object-cover ${className}`} /> : <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#224947] to-[#092b30] text-[#e6ad51]"><BookOpen size={44} strokeWidth={1}/><span className="text-[10px] uppercase tracking-[.2em]">Rooted in Heritage</span></div>;
}

export default function StoryDetails() {
  const { slug } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(""); setStory(null);
    getStoryBySlug(slug).then(r => { if (active) setStory(r.data || null); }).catch(e => { if (active) setError(e?.response?.data?.message || "We couldn't load this story."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);
  const paragraphs = useMemo(() => String(story?.content || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean), [story?.content]);
  const products = useMemo(() => Array.isArray(story?.relatedProducts) ? story.relatedProducts.filter(p => p && typeof p === "object" && p.slug) : [], [story?.relatedProducts]);
  const gallery = useMemo(() => Array.isArray(story?.images) ? story.images.map(imageUrl).filter(Boolean) : [], [story?.images]);
  const minutes = Math.max(1, Math.ceil(String(story?.content || "").split(/\s+/).filter(Boolean).length / 200));
  const copyLink = async () => { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); } catch { setCopied(false); } };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: story.title, url: window.location.href }); } catch { /* share dismissed */ } } else copyLink(); };

  if (loading) return <main className="flex min-h-[75vh] items-center justify-center gap-3 bg-[#f8f0e3] text-[#103d46]"><Loader2 className="animate-spin"/> Opening the story...</main>;
  if (error || !story) return <main className="flex min-h-[75vh] flex-col items-center justify-center bg-[#f8f0e3] px-6 text-center text-[#103d46]"><BookOpen size={40} className="opacity-40"/><h1 className="mt-5 font-display text-4xl">Story unavailable</h1><p className="mt-3 text-sm">{error || "This story is not available."}</p><Link to="/stories" className="mt-7 inline-flex items-center gap-2 text-sm text-[#b95035]"><ArrowLeft size={16}/> Back to Our Stories</Link></main>;

  return <main className="min-h-screen bg-[#faf3e8] text-[#103d46]">
    <section className="relative min-h-[440px] overflow-hidden bg-[#143a3c] text-white md:min-h-[510px]">
      <div className="absolute inset-0"><Picture src={imageUrl(story.coverImage)} alt={story.title}/></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#071b1b]/95 via-[#071b1b]/65 to-[#071b1b]/10" />
      <div className="relative mx-auto flex min-h-[440px] max-w-7xl flex-col justify-center px-6 py-16 md:min-h-[510px]">
        <Link to="/stories" className="mb-7 inline-flex w-fit items-center gap-2 text-xs text-white/80 hover:text-[#e6ad51]"><ArrowLeft size={15}/> Back to the journal</Link>
        <p className="w-fit rounded-full border border-[#e6ad51]/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#e6ad51]">Our Stories / {titleCase(story.category)}</p>
        <h1 className="mt-6 max-w-[700px] font-display text-[clamp(42px,5vw,76px)] leading-[1.06]">{story.title}</h1>
        <p className="mt-6 max-w-lg text-sm leading-8 text-white/85 md:text-base">{story.excerpt}</p>
        <span className="mt-8 h-[2px] w-16 bg-[#e6ad51]"/>
      </div>
    </section>

    <div className="mx-auto max-w-7xl px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#103d46]/15 py-6">
        <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-[#103d46]/65"><Link to="/" className="hover:text-[#b95035]">Home</Link><ChevronRight size={13}/><Link to="/stories" className="hover:text-[#b95035]">Our Stories</Link><ChevronRight size={13}/><span className="max-w-[250px] truncate text-[#103d46]">{story.title}</span></nav>
        <div className="flex items-center gap-3"><button onClick={share} type="button" className="inline-flex items-center gap-2 text-xs hover:text-[#b95035]"><Share2 size={16}/> Share</button><button onClick={copyLink} type="button" className="inline-flex items-center gap-2 text-xs hover:text-[#b95035]"><Copy size={15}/>{copied ? "Copied" : "Copy link"}</button></div>
      </div>

      <div className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_310px] lg:gap-16">
        <article className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px] font-semibold uppercase tracking-[.15em] text-[#a94a30]"><span>{titleCase(story.category)}</span>{story.createdAt && <span className="inline-flex items-center gap-2"><CalendarDays size={15}/>{dateLabel(story.createdAt)}</span>}<span className="inline-flex items-center gap-2"><Clock3 size={15}/>{minutes} min read</span></div>
          <h2 className="mt-6 font-display text-[clamp(36px,4vw,62px)] leading-[1.08]">{story.title}</h2>
          <div className="mt-8 space-y-6">{paragraphs.map((p,i) => <p key={i} className={`whitespace-pre-line leading-[1.95] text-[#183d42]/85 ${i === 0 ? "text-lg" : "text-[15px] md:text-base"}`}>{p}</p>)}</div>
          {gallery.length > 0 && <div className={`mt-10 grid gap-4 ${gallery.length > 1 ? "sm:grid-cols-2" : ""}`}>{gallery.map((src,i) => <div key={`${src}-${i}`} className="aspect-[4/3] overflow-hidden rounded-[18px] bg-[#224947]"><Picture src={src} alt={`${story.title}, detail ${i+1}`} className="transition-transform duration-700 hover:scale-105"/></div>)}</div>}
        </article>

        <aside className="self-start border-t border-[#103d46]/15 pt-8 lg:sticky lg:top-32 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <p className="text-[11px] font-semibold uppercase tracking-[.24em] text-[#b95035]">Artisan profile</p><div className="mt-3 h-px w-14 bg-[#e6ad51]"/>
          <div className="mt-7 flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e9dfce] text-[#b95035]"><BookOpen size={26} strokeWidth={1.2}/></div><div><h3 className="font-display text-xl leading-tight">{story.artisanName || "The hands behind the craft"}</h3>{story.originDistrict && <p className="mt-2 inline-flex items-center gap-1 text-xs text-[#103d46]/65"><MapPin size={13}/>{story.originDistrict}, Sri Lanka</p>}</div></div>
          <p className="mt-6 text-sm italic leading-8 text-[#103d46]/70">A story of the skill, patience and traditions that keep Sri Lankan heritage alive.</p>
          <div className="my-8 h-px bg-[#103d46]/15"/>
          <p className="text-[11px] font-semibold uppercase tracking-[.24em] text-[#b95035]">Story details</p>
          <div className="mt-6 space-y-6"><div className="flex gap-4"><BookOpen size={21} className="shrink-0 text-[#b9853d]"/><div><p className="text-xs text-[#103d46]/55">Craft category</p><p className="mt-1 text-sm font-semibold">{titleCase(story.category)}</p></div></div>{story.originDistrict && <div className="flex gap-4"><MapPin size={21} className="shrink-0 text-[#b9853d]"/><div><p className="text-xs text-[#103d46]/55">Origin</p><p className="mt-1 text-sm font-semibold">{story.originDistrict}</p></div></div>}{story.createdAt && <div className="flex gap-4"><CalendarDays size={21} className="shrink-0 text-[#b9853d]"/><div><p className="text-xs text-[#103d46]/55">Published story</p><p className="mt-1 text-sm font-semibold">{dateLabel(story.createdAt)}</p></div></div>}</div>
        </aside>
      </div>

      {products.length > 0 && <section className="border-t border-[#103d46]/15 py-16"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[.24em] text-[#b95035]">Shop the story</p><h2 className="mt-3 font-display text-4xl md:text-5xl">Related Creations</h2></div><Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold hover:text-[#b95035]">Explore all crafts <ArrowRight size={17}/></Link></div><p className="mt-4 max-w-lg text-sm leading-7 text-[#103d46]/65">Discover creations connected to the traditions you've just explored.</p>
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map(p => <Link key={p._id || p.slug} to={`/shop/${p.slug}`} className="group overflow-hidden rounded-2xl bg-[#fffaf2] shadow-[0_6px_25px_rgba(22,50,50,.06)] transition hover:-translate-y-1 hover:shadow-lg"><div className="aspect-square overflow-hidden bg-[#e9dfce]"><Picture src={imageUrl(p.images?.[0])} alt={p.name} className="transition-transform duration-700 group-hover:scale-105"/></div><div className="flex items-end justify-between gap-3 p-4"><div><h3 className="line-clamp-2 text-sm font-semibold">{p.name}</h3><p className="mt-2 text-xs text-[#103d46]/65">{priceLabel(p)}</p></div><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#103d46] text-white"><ShoppingBag size={16}/></span></div></Link>)}</div>
      </section>}
    </div>
    <section className="bg-[#103d46] px-6 py-16 text-center text-[#fff8ec]"><p className="text-[11px] uppercase tracking-[.28em] text-[#e6ad51]">The journey continues</p><h2 className="mx-auto mt-4 max-w-xl font-display text-4xl md:text-5xl">Every craft has another story.</h2><Link to="/stories" className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#e6ad51] px-7 py-3 text-xs text-[#e6ad51] hover:bg-[#e6ad51] hover:text-[#103d46]">Explore more stories <ArrowUpRight size={16}/></Link></section>
  </main>;
}
