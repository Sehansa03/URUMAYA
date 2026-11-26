
import { useEffect, useRef, useState } from "react";
import {
  Link,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  HandHeart,
  ImageOff,
  Loader2,
  Tag,
  ZoomIn,
  X,
} from "lucide-react";

import {
  getProductBySlug,
  getProducts,
} from "../api/products";

import { getCategories } from "../api/categories";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import "../styles/ProductDetails.css";

/* =========================================
   HELPERS
========================================= */

const formatPrice = (price) =>
  `LKR ${Number(price).toLocaleString("en-LK", {
    maximumFractionDigits: 0,
  })}`;

const formatCategory = (category) =>
  String(category || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

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
    <div className="pd-lotus-divider" aria-hidden="true">
      <span />
      <Lotus />
      <span />
    </div>
  );
}

/* =========================================
   BOTANICAL DECORATION
========================================= */

function Botanical({ className = "" }) {
  return (
    <svg
      viewBox="0 0 200 310"
      className={`pd-botanical ${className}`}
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
   RELATED PRODUCT CARD
========================================= */

function RelatedProductCard({ product }) {
  return (
    <Link
      to={`/shop/${product.slug}`}
      className="pd-related-card"
    >
      <div className="pd-related-image">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="pd-placeholder">
            <ImageOff size={26} />
            <span>Image coming soon</span>
          </div>
        )}

        {product.isFeatured && (
          <span className="pd-featured-badge">
            Artisan Pick
          </span>
        )}

        {product.stockQuantity <= 0 && (
          <span className="pd-sold-out">
            Sold Out
          </span>
        )}

        <span className="pd-card-arrow">
          <ArrowUpRight size={18} />
        </span>
      </div>

      <div className="pd-related-content">
        <p className="pd-eyebrow">
          {formatCategory(product.category)}
        </p>

        <h3>{product.name}</h3>

        <div className="pd-card-bottom">
          <strong>{formatPrice(product.price)}</strong>

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
   IMAGE PREVIEW
========================================= */

function ImagePreview({
  images,
  selectedImage,
  productName,
  onClose,
  onChange,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;

    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="pd-image-preview"
      aria-label={`${productName} image preview`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") onChange(-1);
        if (event.key === "ArrowRight") onChange(1);
      }}
    >
      <div className="pd-preview-inner">
        <button
          type="button"
          className="pd-preview-close"
          onClick={onClose}
          aria-label="Close image preview"
          autoFocus
        >
          <X size={24} />
        </button>

        <img
          src={images[selectedImage]}
          alt={productName}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="pd-gallery-arrow pd-prev"
              onClick={() => onChange(-1)}
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              className="pd-gallery-arrow pd-next"
              onClick={() => onChange(1)}
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>
    </dialog>
  );
}

/* =========================================
   PRODUCT DETAILS PAGE
========================================= */

export default function ProductDetails() {
const { slug } = useParams();

const navigate = useNavigate();
const location = useLocation();

const {
  user,
  isAuthenticated,
  loading: authLoading,
} = useAuth();

const {
  addToCart,
  updating: cartUpdating,
  loading: cartLoading,
  error: cartError,
} = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [cartMessage, setCartMessage] = useState("");
  const [cartActionError, setCartActionError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  /* =========================================
     LOAD CURRENT PRODUCT
  ========================================= */

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setQuantity(1);
      setSelectedImage(0);
      setCartMessage("");
      setCartActionError("");
      setPreviewOpen(false);
      setRelatedProducts([]);
      setRelatedLoading(true);

      window.scrollTo({
        top: 0,
        behavior: "instant",
      });

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
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [slug]);

  /* =========================================
     RELATED PRODUCT RECOMMENDATIONS
  ========================================= */

  useEffect(() => {
    if (!product || product.slug !== slug) return;

    let active = true;

    async function loadRelatedProducts() {
      setRelatedLoading(true);

      const recommendations = [];
      const usedIds = new Set([product._id]);
      const usedSlugs = new Set([product.slug]);

      const addRecommendations = (items) => {
        const sorted = [...items].sort(
          (a, b) =>
            Number(b.stockQuantity > 0) -
            Number(a.stockQuantity > 0)
        );

        for (const item of sorted) {
          if (recommendations.length >= 4) break;

          if (
            !item.slug ||
            usedIds.has(item._id) ||
            usedSlugs.has(item.slug)
          ) {
            continue;
          }

          recommendations.push(item);
          usedIds.add(item._id);
          usedSlugs.add(item.slug);
        }
      };

      try {
        // First preference: products in the same category.

        const categories = await getCategories();

        const matchedCategory = (
          categories.data || []
        ).find(
          (item) =>
            normalize(item.name) ===
              normalize(product.category) ||
            normalize(item.slug) ===
              normalize(product.category)
        );

        const categorySlug =
          matchedCategory?.slug ||
          normalize(product.category);

        if (categorySlug) {
          const result = await getProducts({
            category: categorySlug,
            sort: "newest",
            page: 1,
            limit: 12,
          });

          addRecommendations(result.data || []);
        }
      } catch (err) {
        console.error(
          "Category recommendations unavailable:",
          err
        );
      }

      // Fallback: recommend products from all categories
      // only when no same-category products are available.

      if (recommendations.length === 0) {
        try {
          const result = await getProducts({
            sort: "newest",
            page: 1,
            limit: 12,
          });

          addRecommendations(result.data || []);
        } catch (err) {
          console.error(
            "Collection recommendations unavailable:",
            err
          );
        }
      }

      if (active) {
        setRelatedProducts(recommendations);
        setRelatedLoading(false);
      }
    }

    loadRelatedProducts();

    return () => {
      active = false;
    };
  }, [product, slug]);

  /* =========================================
     ADD TO BAG
  ========================================= */


const handleAddToCart = async () => {
  setCartMessage("");
  setCartActionError("");

  // Wait until authentication is initialized
  if (authLoading) return;

  // Redirect guests to registration
  if (!isAuthenticated) {
    navigate("/register", {
      state: {
        from: location,
      },
    });

    return;
  }

  // Only customers can use the shopping cart
  if (user?.role !== "customer") {
    setCartActionError(
      "Shopping bags are available for customer accounts only."
    );

    return;
  }

  // Prevent repeated requests
  if (cartUpdating || cartLoading) return;

  // Validate product availability
  if (
    !product ||
    product.stockQuantity <= 0 ||
    quantity > product.stockQuantity
  ) {
    setCartActionError(
      "The selected quantity is unavailable."
    );

    return;
  }

  // Wait for the backend response
  const added = await addToCart(product, quantity);

  if (added) {
    setCartMessage(
      `${quantity} ${
        quantity === 1 ? "item" : "items"
      } added to your shopping bag!`
    );
  } else {
    setCartActionError(
      "Unable to add this product to your shopping bag."
    );
  }
};


  /* =========================================
     LOADING AND ERROR STATES
  ========================================= */

  if (loading || (product && product.slug !== slug)) {
    return (
      <main className="urumaya-product-details pd-page-state">
        <Lotus className="pd-state-lotus" />
        <Loader2 size={24} className="pd-spinner" />

        <p role="status">
          Discovering your treasure...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="urumaya-product-details pd-page-state">
        <Lotus className="pd-state-lotus" />

        <h1>Treasure Not Found</h1>

        <p role="alert">
          {error || "This product is unavailable."}
        </p>

        <Link to="/shop" className="pd-primary-button">
          <ArrowLeft size={16} />
          Return to Collection
        </Link>
      </main>
    );
  }

  /* =========================================
     PRODUCT VARIABLES
  ========================================= */

  const images = product.images || [];
  const inStock = product.stockQuantity > 0;
  const maxQuantity = Math.max(1, product.stockQuantity);

  const changeQuantity = (amount) => {
    setQuantity((current) =>
      Math.min(
        maxQuantity,
        Math.max(1, current + amount)
      )
    );

    setCartMessage("");
  };

  const changeImage = (direction) => {
    if (images.length <= 1) return;

    setSelectedImage(
      (current) =>
        (current + direction + images.length) %
        images.length
    );
  };

  /* =========================================
     PAGE CONTENT
  ========================================= */

  return (
    <main className="urumaya-product-details">
      <section className="pd-main-section">
        <Botanical className="pd-main-leaf-left" />
        <Botanical className="pd-main-leaf-right" />

        <div className="pd-container">
          {/* Breadcrumb */}

          <nav
            className="pd-breadcrumb"
            aria-label="Breadcrumb"
          >
            <Link to="/">Home</Link>

            <ChevronRight size={12} />

            <Link to="/shop">Collection</Link>

            <ChevronRight size={12} />

            <span>
              {formatCategory(product.category)}
            </span>

            <ChevronRight size={12} />

            <span aria-current="page">
              {product.name}
            </span>
          </nav>

          <div className="pd-product-grid">
            {/* =================================
                PRODUCT GALLERY
            ================================= */}

            <div className="pd-gallery">
              <div className="pd-main-image">
                {images.length > 0 ? (
                  <img
                    key={`${slug}-${selectedImage}`}
                    src={images[selectedImage]}
                    alt={`${product.name} — view ${
                      selectedImage + 1
                    }`}
                    fetchPriority="high"
                    className="pd-active-image"
                  />
                ) : (
                  <div className="pd-placeholder">
                    <ImageOff size={36} />
                    <span>Image coming soon</span>
                  </div>
                )}

                {product.isFeatured && (
                  <span className="pd-featured-badge">
                    Artisan Pick
                  </span>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="pd-gallery-arrow pd-prev"
                      onClick={() => changeImage(-1)}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={21} />
                    </button>

                    <button
                      type="button"
                      className="pd-gallery-arrow pd-next"
                      onClick={() => changeImage(1)}
                      aria-label="Next image"
                    >
                      <ChevronRight size={21} />
                    </button>
                  </>
                )}

                {images.length > 0 && (
                  <button
                    type="button"
                    className="pd-zoom-button"
                    onClick={() => setPreviewOpen(true)}
                    aria-label="Enlarge product image"
                  >
                    <ZoomIn size={19} />
                  </button>
                )}
              </div>

              {images.length > 1 && (
                <div
                  className="pd-thumbnails"
                  aria-label="Product image thumbnails"
                >
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      aria-label={`View image ${index + 1}`}
                      aria-pressed={selectedImage === index}
                      className={`pd-thumbnail ${
                        selectedImage === index
                          ? "pd-thumbnail-active"
                          : ""
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="pd-gallery-caption">
                <HandHeart size={16} />
                Rooted in heritage. Crafted with care.
              </div>
            </div>

            {/* =================================
                PRODUCT INFORMATION
            ================================= */}

            <div className="pd-information">
              <div className="pd-category-line">
                <span />

                <p className="pd-eyebrow">
                  {formatCategory(product.category)}
                </p>
              </div>

              <h1 className="pd-product-title">
                {product.name}
              </h1>

              {product.originDistrict && (
                <div className="pd-origin-label">
                  <MapPin size={14} />

                  {product.originDistrict}, Sri Lanka
                </div>
              )}

              {/* Price and stock on the same row */}

              <div className="pd-price-row">
                <p className="pd-price">
                  {formatPrice(product.price)}
                </p>

                <span
                  className={`pd-stock ${
                    inStock
                      ? "pd-in-stock"
                      : "pd-out-of-stock"
                  }`}
                >
                  <span className="pd-stock-dot" />

                  {inStock
                    ? `In stock · ${product.stockQuantity} available`
                    : "Currently out of stock"}
                </span>
              </div>

              <p className="pd-description">
                {product.description}
              </p>

              {/* Quantity */}

              <div className="pd-quantity-section">
                <p className="pd-field-label">
                  Quantity
                </p>

                <div className="pd-quantity-row">
                  <div className="pd-quantity-control">
                    <button
                      type="button"
                      onClick={() => changeQuantity(-1)}
                      disabled={!inStock || quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={17} />
                    </button>

                    <span aria-live="polite">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => changeQuantity(1)}
                      disabled={
                        !inStock ||
                        quantity >= maxQuantity
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus size={17} />
                    </button>
                  </div>

                  {inStock && (
                    <span className="pd-quantity-limit">
                      Maximum {product.stockQuantity} units
                    </span>
                  )}
                </div>
              </div>

              {/* Add to bag */}


<button
  type="button"
  className="pd-primary-button pd-add-button"
  onClick={handleAddToCart}
  disabled={
    !inStock ||
    authLoading ||
    cartUpdating ||
    cartLoading
  }
  aria-busy={cartUpdating}
>
  {cartUpdating ? (
    <Loader2 size={19} className="pd-spinner" />
  ) : (
    <ShoppingBag size={19} />
  )}

  {!inStock
    ? "Sold Out"
    : cartUpdating
      ? "Adding to Bag..."
      : "Add to Bag"}

  {inStock && !cartUpdating && (
    <ArrowRight
      size={18}
      className="pd-button-arrow"
    />
  )}
</button>


              {cartMessage && (
                <div className="pd-cart-message" role="status">
                  <Check size={18} />

                  <p>{cartMessage}</p>

                  <Link to="/cart">
                    View Bag
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              )}

              {cartActionError && (
  <div className="pd-cart-error" role="alert">
    <p>
      {isAuthenticated &&
      user?.role === "customer" &&
      cartActionError ===
        "Unable to add this product to your shopping bag."
        ? cartError || cartActionError
        : cartActionError}
    </p>
  </div>
)}

              {/* Compact product metadata */}

              <div className="pd-metadata">
                {product.artisanName && (
                  <div className="pd-meta-item">
                    <span className="pd-meta-icon">
                      <HandHeart size={18} />
                    </span>

                    <div>
                      <strong>Crafted by</strong>
                      <p>{product.artisanName}</p>
                    </div>
                  </div>
                )}

                {product.originDistrict && (
                  <div className="pd-meta-item">
                    <span className="pd-meta-icon">
                      <MapPin size={18} />
                    </span>

                    <div>
                      <strong>Origin</strong>
                      <p>
                        {product.originDistrict}, Sri Lanka
                      </p>
                    </div>
                  </div>
                )}

                {product.sku && (
                  <div className="pd-meta-item">
                    <span className="pd-meta-icon">
                      <Tag size={17} />
                    </span>

                    <div>
                      <strong>Product Code</strong>
                      <p>{product.sku}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          COMPACT HERITAGE STORY BANNER
      ===================================== */}

      {product.heritageStory && (
        <section className="pd-heritage-section">
          <div className="pd-container">
            <div className="pd-heritage-card">
              <Botanical className="pd-story-leaf-left" />
              <Botanical className="pd-story-leaf-right" />



              <div className="pd-story-heading">
                <p className="pd-eyebrow">
                  Behind the Craft
                </p>

                <h2>
                  Every Piece
                  <br />
                  Has a Story.
                </h2>
              </div>

              <div className="pd-story-content">
                <p>{product.heritageStory}</p>

                <Link to="/stories">
                  Explore Our Stories
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================
          RELATED PRODUCTS
      ===================================== */}

      <section
        className="pd-related-section"
        aria-labelledby="pd-related-heading"
      >
        <Botanical className="pd-related-leaf-left" />
        <Botanical className="pd-related-leaf-right" />

        <div className="pd-container">
          <div className="pd-section-heading">
            <LotusDivider />

            <p className="pd-eyebrow">
              Continue Your Discovery
            </p>

            <h2 id="pd-related-heading">
              You May Also Treasure
            </h2>

            <p className="pd-section-description">
              Discover more handcrafted treasures,
              each carrying its own story of heritage.
            </p>
          </div>

          {relatedLoading ? (
            <div
              className="pd-related-loading"
              role="status"
            >
              <Loader2 size={22} className="pd-spinner" />
              Discovering more treasures...
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="pd-related-grid">
              {relatedProducts.map((item) => (
                <RelatedProductCard
                  key={item._id}
                  product={item}
                />
              ))}
            </div>
          ) : (
            <p className="pd-related-empty">
              Explore our collection to discover more
              handcrafted treasures.
            </p>
          )}

          <div className="pd-return-section">
            <Link to="/shop" className="pd-outline-button">
              <ArrowLeft size={16} />
              Explore All Collections
            </Link>
          </div>
        </div>
      </section>

      {/* Image zoom preview */}

      {previewOpen && images.length > 0 && (
        <ImagePreview
          images={images}
          selectedImage={selectedImage}
          productName={product.name}
          onClose={() => setPreviewOpen(false)}
          onChange={changeImage}
        />
      )}
    </main>
  );
}
