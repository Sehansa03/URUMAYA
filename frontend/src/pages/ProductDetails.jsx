
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";

import { getProductBySlug } from "../api/products";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price);

export default function ProductDetails() {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setQuantity(1);
      setSelectedImage(0);

      try {
        const result = await getProductBySlug(slug);

        if (active) {
          setProduct(result.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.status === 404
              ? "This treasure could not be found."
              : "We couldn't load this product. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-urumaya-ivory">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-urumaya-terracotta/20 border-t-urumaya-terracotta" />
          <p className="mt-5 text-xs uppercase tracking-[0.25em] text-urumaya-ink/60">
            Discovering your treasure...
          </p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[75vh] flex-col items-center justify-center bg-urumaya-ivory px-6 text-center">
        <h1 className="font-display text-5xl text-urumaya-forest">
          Treasure Not Found
        </h1>

        <p className="mt-4 text-sm text-urumaya-ink/60">
          {error || "This product is currently unavailable."}
        </p>

        <Link
          to="/shop"
          className="mt-8 rounded-full bg-urumaya-forest px-7 py-3 text-xs font-semibold text-white"
        >
          Return to Collection
        </Link>
      </main>
    );
  }

  const images = product.images || [];
  const inStock = product.stockQuantity > 0;
  const maxQuantity = Math.max(1, product.stockQuantity);

  return (
    <main className="min-h-screen bg-urumaya-ivory text-urumaya-ink">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-12 sm:px-10">

        {/* BREADCRUMB */}
        <nav
          aria-label="Breadcrumb"
          className="mb-10 flex flex-wrap items-center gap-2 text-xs text-urumaya-ink/55"
        >
          <Link to="/" className="hover:text-urumaya-terracotta">
            Home
          </Link>

          <ChevronRight size={13} />

          <Link to="/shop" className="hover:text-urumaya-terracotta">
            Collection
          </Link>

          <ChevronRight size={13} />

          <span className="text-urumaya-forest">
            {product.name}
          </span>
        </nav>

        {/* MAIN PRODUCT */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">

          {/* IMAGE GALLERY */}
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#E9E1D5]">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-urumaya-ink/40">
                  Image coming soon
                </div>
              )}

              {product.isFeatured && (
                <span className="absolute left-5 top-5 rounded-full bg-urumaya-ivory/95 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-urumaya-forest">
                  Artisan Pick
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    className={`h-24 w-20 overflow-hidden rounded-xl border-2 ${
                      selectedImage === index
                        ? "border-urumaya-terracotta"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-urumaya-terracotta">
              {product.category}
            </p>

            <h1 className="mt-5 font-display text-[clamp(48px,5vw,76px)] leading-[0.98] text-urumaya-forest">
              {product.name}
            </h1>

            <p className="mt-7 font-display text-4xl text-urumaya-terracotta">
              {formatPrice(product.price)}
            </p>

            <div className="mt-6 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  inStock ? "bg-green-600" : "bg-red-500"
                }`}
              />

              <span className="text-xs font-medium text-urumaya-ink/70">
                {inStock
                  ? `${product.stockQuantity} available`
                  : "Currently out of stock"}
              </span>
            </div>

            <div className="my-8 h-px bg-urumaya-ink/15" />

            <p className="text-sm leading-8 text-urumaya-ink/70">
              {product.description}
            </p>

            {/* QUANTITY */}
            <div className="mt-10">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-urumaya-ink/65">
                Quantity
              </p>

              <div className="flex items-center gap-4">
                <div className="flex h-13 items-center rounded-full border border-urumaya-ink/20">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                    disabled={!inStock || quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex h-12 w-12 items-center justify-center disabled:opacity-30"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-10 text-center text-sm font-semibold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(maxQuantity, q + 1)
                      )
                    }
                    disabled={!inStock || quantity >= maxQuantity}
                    aria-label="Increase quantity"
                    className="flex h-12 w-12 items-center justify-center disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <span className="text-xs text-urumaya-ink/45">
                  Maximum {product.stockQuantity} units
                </span>
              </div>
            </div>

            {/* CART BUTTON - CONNECT IN NEXT STEP */}
            <button
              type="button"
              disabled
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-urumaya-terracotta px-8 py-4 text-sm font-semibold text-white opacity-60 sm:w-auto"
            >
              <ShoppingBag size={18} />
              {inStock ? "Add to Bag — Coming Next" : "Sold Out"}
              <ArrowRight size={17} />
            </button>

            <p className="mt-3 text-xs text-urumaya-ink/45">
              Shopping bag functionality will be connected next.
            </p>

            {/* PRODUCT METADATA */}
            <div className="mt-10 space-y-4 border-t border-urumaya-ink/15 pt-7">
              {product.artisanName && (
                <div className="flex items-start gap-3">
                  <Check
                    size={16}
                    className="mt-0.5 text-urumaya-terracotta"
                  />

                  <div>
                    <p className="text-xs font-semibold text-urumaya-forest">
                      Crafted by
                    </p>
                    <p className="mt-1 text-sm text-urumaya-ink/65">
                      {product.artisanName}
                    </p>
                  </div>
                </div>
              )}

              {product.originDistrict && (
                <div className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="mt-0.5 text-urumaya-terracotta"
                  />

                  <div>
                    <p className="text-xs font-semibold text-urumaya-forest">
                      Origin
                    </p>
                    <p className="mt-1 text-sm text-urumaya-ink/65">
                      {product.originDistrict}, Sri Lanka
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs text-urumaya-ink/45">
                Product Code: {product.sku}
              </p>
            </div>
          </div>
        </div>

        {/* HERITAGE STORY */}
        {product.heritageStory && (
          <section className="mt-24 overflow-hidden rounded-[30px] bg-urumaya-forest px-7 py-16 text-urumaya-ivory sm:px-12 lg:px-20">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.5fr]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-urumaya-gold">
                  Behind the Craft
                </p>

                <h2 className="mt-5 font-display text-5xl leading-tight sm:text-6xl">
                  Every Piece
                  <br />
                  Has a Story.
                </h2>
              </div>

              <div className="border-l border-urumaya-gold/40 pl-6 sm:pl-10">
                <p className="font-display text-2xl leading-relaxed text-urumaya-ivory/85 sm:text-3xl">
                  {product.heritageStory}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* RETURN TO SHOP */}
        <div className="mt-16 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 border-b border-urumaya-terracotta pb-2 text-xs font-semibold uppercase tracking-[0.15em] text-urumaya-terracotta"
          >
            <ArrowLeft size={16} />
            Back to Collection
          </Link>
        </div>
      </div>
    </main>
  );
}
