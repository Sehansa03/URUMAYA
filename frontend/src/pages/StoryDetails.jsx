import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, BookOpen, Loader2, MapPin } from "lucide-react";
import { getStoryBySlug } from "../api/stories";

const titleCase = (value = "") => value.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
const imageUrl = (image) => typeof image === "string" ? image : image?.url || image?.secure_url || "";

export default function StoryDetails() {
  const { slug } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getStoryBySlug(slug).then((response) => { if (!cancelled) setStory(response.data || null); }).catch((err) => { if (!cancelled) setError(err?.response?.data?.message || "We couldn't load this story."); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <main className="flex min-h-[70vh] items-center justify-center gap-3 bg-[#F6EEDF] text-[#103D46]"><Loader2 className="animate-spin" /> Opening the story...</main>;
  if (error || !story) return <main className="min-h-[70vh] bg-[#F6EEDF] px-6 py-28 text-center text-[#103D46]"><BookOpen size={40} className="mx-auto opacity-50" /><h1 className="mt-6 font-display text-4xl">Story unavailable</h1><p className="mt-4">{error || "This story is not available."}</p><Link className="mt-7 inline-block underline" to="/stories">Back to Our Stories</Link></main>;

  const paragraphs = story.content.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const products = Array.isArray(story.relatedProducts) ? story.relatedProducts.filter((p) => p && typeof p === "object" && p.slug) : [];
  return <main className="min-h-screen bg-[#F6EEDF] text-[#103D46]">
    <header className="mx-auto max-w-7xl px-6 pb-12 pt-12 md:pb-16 md:pt-20">
      <Link to="/stories" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#B95035] hover:underline"><ArrowLeft size={16} /> Back to the journal</Link>
      <p className="mt-14 text-xs uppercase tracking-[0.3em] text-[#B95035]">The Heritage Journal / {titleCase(story.category)}</p>
      <h1 className="mt-5 max-w-5xl font-display text-5xl leading-[1.08] md:text-7xl lg:text-8xl">{story.title}</h1>
      <p className="mt-7 max-w-2xl text-lg leading-9 text-[#103D46]/70">{story.excerpt}</p>
      <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#103D46]/15 pt-6 text-xs uppercase tracking-[0.15em] text-[#103D46]/65">{story.artisanName && <span>Artisan · {story.artisanName}</span>}{story.originDistrict && <span className="inline-flex items-center gap-2"><MapPin size={14} /> {story.originDistrict}, Sri Lanka</span>}</div>
    </header>
    <div className="mx-auto max-w-7xl px-6"><div className="h-[340px] overflow-hidden rounded-xl bg-[#214A48] md:h-[620px]">{story.coverImage ? <img src={story.coverImage} alt={story.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#F6EEDF]/70"><BookOpen size={60} /></div>}</div></div>
    <article className="mx-auto max-w-3xl px-6 py-20 md:py-28"><div className="mb-12 flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-[#B95035]"><span>The Story</span><span className="h-px flex-1 bg-[#103D46]/20" /></div>{paragraphs.map((paragraph, i) => <p key={i} className={`mb-8 whitespace-pre-line leading-9 text-[#103D46]/85 ${i === 0 ? "font-display text-2xl leading-relaxed md:text-3xl" : "text-base md:text-lg"}`}>{paragraph}</p>)}</article>
    {Array.isArray(story.images) && story.images.length > 0 && <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-24 md:grid-cols-2">{story.images.filter(Boolean).map((src, i) => <div key={`${src}-${i}`} className="aspect-[4/3] overflow-hidden rounded-xl bg-[#214A48]"><img src={src} alt={`${story.title} — detail ${i + 1}`} loading="lazy" className="h-full w-full object-cover" /></div>)}</section>}
    {products.length > 0 && <section className="bg-white px-6 py-24"><div className="mx-auto max-w-7xl"><p className="text-xs uppercase tracking-[0.3em] text-[#B95035]">From heritage to your home</p><div className="mt-4 flex flex-wrap items-end justify-between gap-5"><h2 className="font-display text-4xl md:text-6xl">Shop the story</h2><Link to="/shop" className="inline-flex items-center gap-2 text-sm">Explore all crafts <ArrowUpRight size={18} /></Link></div><p className="mt-5 max-w-xl text-sm leading-7 text-[#103D46]/65">Discover creations connected to the traditions you've just explored.</p><div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <Link to={`/shop/${product.slug}`} key={product._id} className="group"><div className="aspect-square overflow-hidden rounded-xl bg-[#F6EEDF]">{imageUrl(product.images?.[0]) ? <img src={imageUrl(product.images[0])} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[#103D46]/35"><BookOpen size={35} /></div>}</div><p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-[#B95035]">{titleCase(product.category)}</p><div className="mt-2 flex items-start justify-between gap-3"><h3 className="font-display text-2xl">{product.name}</h3><ArrowUpRight size={18} /></div><p className="mt-2 text-sm text-[#103D46]/65">{product.currency || "LKR"} {typeof product.price === "number" ? product.price.toLocaleString() : product.price}</p></Link>)}</div></div></section>}
    <section className="bg-[#103D46] px-6 py-20 text-center text-[#F6EEDF]"><p className="text-xs uppercase tracking-[0.3em] text-[#E6AD51]">The journey continues</p><h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl md:text-6xl">Every craft has another story.</h2><Link to="/stories" className="mt-9 inline-flex items-center gap-3 rounded-full border border-[#E6AD51] px-7 py-3 text-sm text-[#E6AD51] transition hover:bg-[#E6AD51] hover:text-[#103D46]">Explore more stories <ArrowUpRight size={18} /></Link></section>
  </main>;
}
