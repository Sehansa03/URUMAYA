import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MapPin,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderAPI } from "../api/orders";
import "../styles/Checkout.css";

const SHIPPING_FEE = 500;
const PENDING_ORDER_KEY = "urumaya_pending_order";

const getPendingOrderKey = (userId) =>
  `${PENDING_ORDER_KEY}_${userId}`;

const isPayableOrder = (order) =>
  order?.paymentStatus === "pending" &&
  order?.orderStatus === "pending" &&
  Boolean(order?.paymentExpiresAt) &&
  new Date(order.paymentExpiresAt).getTime() > Date.now();

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const initialAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
  postalCode: "",
  country: "Sri Lanka",
};

const inputClass =
  "w-full rounded-xl border border-urumaya-ink/15 bg-white px-4 py-3.5 text-sm text-urumaya-ink outline-none transition focus:border-urumaya-terracotta focus:ring-2 focus:ring-urumaya-terracotta/10";

function Field({ label, name, value, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-urumaya-forest">
        {label}
      </span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className={inputClass}
        {...props}
      />
    </label>
  );
}

function CheckoutLeaves({ className = "" }) {
  return (
    <svg
      viewBox="0 0 200 310"
      className={className}
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

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
  cartItems,
  cartSubtotal,
  refreshCart,
  loading: cartLoading,
  updating: cartUpdating,
  error: cartError,
} = useCart();

const hasUnavailableItems = cartItems.some(
  (item) => !item.isAvailable
);

const cartBlocked =
  cartLoading ||
  cartUpdating ||
  Boolean(cartError) ||
  hasUnavailableItems ||
  cartItems.length === 0;
  

  const [address, setAddress] = useState({
    ...initialAddress,
    fullName: user?.fullName || "",
  });

  const [step, setStep] = useState("shipping");
  const [recovering, setRecovering] = useState(true);
  const [recoveryError, setRecoveryError] = useState("");
  const userId = user?.id || user?._id;
  const storageKey = userId ? getPendingOrderKey(userId) : null;

  
  const [cardDetails, setCardDetails] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  
  
const handleCardChange = (event) => {
  const { name, value } = event.target;

  setCardDetails((previous) => ({
    ...previous,
    [name]: value,
  }));

  setError("");
};

const validateDemoCard = () => {
  const name = cardDetails.cardholderName.trim().toUpperCase();
  const number = cardDetails.cardNumber.replace(/\s/g, "");
  const expiry = cardDetails.expiryDate.trim();
  const cvv = cardDetails.cvv.trim();

  if (
    name !== "DEMO CUSTOMER" ||
    number !== "4242424242424242" ||
    expiry !== "12/30" ||
    cvv !== "123"
  ) {
    setError(
      "Invalid demo card details. Please use the fictional test values shown below."
    );
    return false;
  }

  return true;
};



  const [order, setOrder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Restore a pending order after refreshing or revisiting checkout.
  useEffect(() => {
    let active = true;

    const recoverOrder = async () => {
      if (!storageKey) {
        if (active) {
          setRecoveryError("Unable to identify your customer session.");
          setRecovering(false);
        }
        return;
      }

      let savedId;
      try {
        savedId = sessionStorage.getItem(storageKey);
      } catch {
        if (active) {
          setRecoveryError("Browser session storage is unavailable. Please enable it to continue checkout.");
          setRecovering(false);
        }
        return;
      }

      if (!savedId) {
        if (active) {
          setRecoveryError("");
          setRecovering(false);
        }
        return;
      }

      try {
        const response = await orderAPI.getOrderById(savedId);
        if (!active) return;
        const savedOrder = response.data.data;

        if (isPayableOrder(savedOrder)) {
          setOrder(savedOrder);
          setStep("payment");
          setRecoveryError("");
        } else {
          sessionStorage.removeItem(storageKey);
          setRecoveryError(
            savedOrder.paymentStatus === "paid"
              ? "Your previous order was already paid. Please check your order records before placing another."
              : "Your previous order is no longer awaiting payment. You can start a new checkout."
          );
        }
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 404 || err.response?.status === 400) {
          sessionStorage.removeItem(storageKey);
          setRecoveryError("The saved order could not be found. You can start a new checkout.");
        } else {
          // Do not permit another order until the existing one can be checked.
          setRecoveryError("We couldn't verify your pending order. Check your connection and reload this page before placing another order.");
        }
      } finally {
        if (active) setRecovering(false);
      }
    };

    recoverOrder();
    return () => { active = false; };
  }, [storageKey]);

  const recoveryBlocked = Boolean(
    recoveryError.includes("couldn't verify") ||
    recoveryError.includes("storage is unavailable") ||
    recoveryError.includes("identify your customer session") ||
    recoveryError.includes("already paid")
  );

  const total = cartSubtotal + SHIPPING_FEE;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const getErrorMessage = (err) =>
    err.response?.data?.message ||
    "Something went wrong. Please try again.";

  const handleCreateOrder = async (event) => {
    event.preventDefault();

    if (
  processing ||
  recovering ||
  order ||
  recoveryBlocked ||
  cartBlocked
) {
  return;
}

    setProcessing(true);
    setError("");

    try {
      const response = await orderAPI.createOrder({
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: address,
      });

      const createdOrder = response.data.data;
      setOrder(createdOrder);
      setStep("payment");
      try {
        sessionStorage.setItem(storageKey, createdOrder._id);
      } catch {
        setError("Order created, but this browser cannot save your payment session. Please finish payment without refreshing.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  
const handlePayment = async (result) => {
  if (processing || !order) return;

  if (!isPayableOrder(order)) {
    setError("This order's payment window has expired. Please reload checkout to check its status.");
    return;
  }

  if (result === "success" && !validateDemoCard()) {
    return;
  }

  setProcessing(true);

    setError("");

    try {
      const response = await orderAPI.processMockPayment(
        order._id,
        result
      );

      const updatedOrder = response.data.data;
      setOrder(updatedOrder);
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        // Session storage may be disabled.
      }

      if (updatedOrder.paymentStatus === "paid") {
        await refreshCart();
      }

      setStep("confirmation");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  if (recovering || (cartLoading && !order)) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-urumaya-ivory px-6 text-center text-urumaya-forest">
        <p className="font-display text-2xl">Preparing your checkout...</p>
      </main>
    );
  }

  if (recoveryBlocked && !order) {
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center bg-urumaya-ivory px-6 text-center">
        <h1 className="font-display text-4xl text-urumaya-forest">Checkout needs your attention</h1>
        <p role="alert" className="mt-5 max-w-lg text-sm leading-7 text-urumaya-ink/70">{recoveryError}</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-7 rounded-full bg-urumaya-terracotta px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white">Check Again</button>
        <Link to="/shop" className="mt-5 text-sm text-urumaya-terracotta">Return to Shop</Link>
      </main>
    );
  }

  if ((hasUnavailableItems || cartError) && !order) {
  return (
    <main className="flex min-h-[65vh] flex-col items-center justify-center bg-urumaya-ivory px-6 text-center">

      <ShoppingBag
        size={44}
        strokeWidth={1.3}
        className="text-urumaya-terracotta"
      />

      <h1 className="mt-6 font-display text-4xl text-urumaya-forest">
        Your Shopping Bag Needs Attention
      </h1>

      <p
        role="alert"
        className="mt-5 max-w-lg text-sm leading-7 text-urumaya-ink/70"
      >
        {cartError ||
          "Some products are no longer available in the requested quantity. Please update your shopping bag before continuing."}
      </p>

      <Link
        to="/cart"
        className="mt-8 rounded-full bg-urumaya-terracotta px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white"
      >
        Return to Shopping Bag
      </Link>

    </main>
  );
}

  if (cartItems.length === 0 && !order) {
    return (
      <main className="flex min-h-[75vh] flex-col items-center justify-center bg-urumaya-ivory px-6 py-20 text-center">
        <ShoppingBag
          size={44}
          strokeWidth={1.3}
          className="text-urumaya-terracotta"
        />
        <h1 className="mt-6 font-display text-5xl text-urumaya-forest">
          Your bag is empty.
        </h1>
        <p className="mt-4 text-sm text-urumaya-ink/60">
          Discover something meaningful before checking out.
        </p>
        <Link
          to="/shop"
          className="mt-8 rounded-full bg-urumaya-terracotta px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white"
        >
          Explore Collection
        </Link>
      </main>
    );
  }

  return (
    <main className="urumaya-checkout">
     <CheckoutLeaves className="uc-leaves uc-leaves-left" />
     <CheckoutLeaves className="uc-leaves uc-leaves-right" />
      <section className="uc-heading">
        <p className="uc-eyebrow">A Thoughtful Purchase</p>
        <h1>{step === "shipping" ? "Checkout" : step === "payment" ? "Complete Your Order" : "Order Confirmation"}</h1>
        <div className="uc-lotus-divider">
          <span />
          <svg viewBox="0 0 64 44" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M32 38C17 27 22 13 32 4C42 13 47 27 32 38Z M32 38C13 38 7 23 9 12C23 15 30 24 32 38Z M32 38C51 38 57 23 55 12C41 15 34 24 32 38Z M32 38C15 44 4 34 2 24C16 24 25 30 32 38Z M32 38C49 44 60 34 62 24C48 24 39 30 32 38Z" />
          </svg>
          <span />
        </div>
        <p className="uc-subtitle">Complete your order in a few simple steps.</p>
        <div className="uc-progress">
          {["shipping", "payment", "confirmation"].map((stage, index, stages) => {
            const currentIndex = stages.indexOf(step);
            return (
              <div key={stage} className={`uc-step ${index === currentIndex ? "active" : index < currentIndex ? "completed" : ""}`} aria-current={index === currentIndex ? "step" : undefined}>
                <div className="uc-step-number">{index < currentIndex ? "✓" : index + 1}</div>
                <span>{stage.charAt(0).toUpperCase() + stage.slice(1)}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="uc-container">
        <div className="uc-grid">
          <div className="min-w-0">
            {recoveryError && (
              <div role="status" className="mb-7 rounded-xl border border-urumaya-gold/30 bg-white px-5 py-4 text-sm text-urumaya-ink/75">
                {recoveryError}
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="mb-7 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {step === "shipping" && (
              <>
                <Link
                  to="/cart"
                  className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-urumaya-terracotta"
                >
                  <ArrowLeft size={15} />
                  Back to Shopping Bag
                </Link>

                <div className="mb-8 flex items-center gap-3">
                  <MapPin
                    size={25}
                    className="text-urumaya-terracotta"
                  />
                  <h2 className="font-display text-4xl text-urumaya-forest">
                    Shipping Details
                  </h2>
                </div>

                <form
                  onSubmit={handleCreateOrder}
                  className="uc-form"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field
                        label="Full Name *"
                        name="fullName"
                        value={address.fullName}
                        onChange={handleChange}
                        required
                        maxLength={100}
                      />
                    </div>

                    <Field
                      label="Phone Number *"
                      name="phone"
                      value={address.phone}
                      onChange={handleChange}
                      placeholder="07XXXXXXXX"
                      required
                      pattern="(?:\+94|0)7[0-9]{8}"
                      title="Enter a valid Sri Lankan mobile number"
                    />

                    <Field
                      label="Postal Code *"
                      name="postalCode"
                      value={address.postalCode}
                      onChange={handleChange}
                      placeholder="10250"
                      required
                      pattern="[0-9]{5}"
                      maxLength={5}
                    />

                    <div className="sm:col-span-2">
                      <Field
                        label="Address Line 1 *"
                        name="addressLine1"
                        value={address.addressLine1}
                        onChange={handleChange}
                        placeholder="House number and street"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Field
                        label="Address Line 2 (Optional)"
                        name="addressLine2"
                        value={address.addressLine2}
                        onChange={handleChange}
                        placeholder="Apartment, landmark, etc."
                      />
                    </div>

                    <Field
                      label="City *"
                      name="city"
                      value={address.city}
                      onChange={handleChange}
                      required
                    />

                    <Field
                      label="District *"
                      name="district"
                      value={address.district}
                      onChange={handleChange}
                      required
                    />

                    <div className="sm:col-span-2">
                      <Field
                        label="Country"
                        name="country"
                        value={address.country}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                          processing ||
                          recovering ||
                          recoveryBlocked ||
                          cartBlocked
                  }
                    className="mt-9 flex w-full items-center justify-center gap-3 rounded-full bg-urumaya-terracotta px-6 py-4 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[#CC7050] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processing
                      ? "Creating Your Order..."
                      : "Continue to Payment"}
                    <ArrowRight size={16} />
                  </button>
                </form>
              </>
            )}

            
{step === "payment" && order && (
  <div className="rounded-[26px] border border-urumaya-ink/10 bg-white p-7 sm:p-10">
    <div className="flex items-center gap-3">
      <CreditCard
        size={30}
        className="text-urumaya-terracotta"
      />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-urumaya-terracotta">
          Demonstration Checkout
        </p>
        <h2 className="mt-2 font-display text-4xl text-urumaya-forest">
          Card Payment
        </h2>
      </div>
    </div>

    <div className="mt-7 rounded-xl border border-urumaya-gold/30 bg-urumaya-ivory p-5">
      <p className="text-sm font-semibold text-urumaya-forest">
        Demo Payment Only
      </p>
      <p className="mt-2 text-xs leading-6 text-urumaya-ink/65">
        Use fictional card details for testing. No real
        money will be charged. Do not enter actual
        banking information.
      </p>
    </div>

    
<div className="mt-6 rounded-xl border border-urumaya-terracotta/20 bg-urumaya-ivory p-5">
  <p className="text-xs font-semibold uppercase tracking-widest text-urumaya-terracotta">
    Demo Card for Testing
  </p>

  <div className="mt-4 space-y-2 text-sm text-urumaya-ink/75">
    <p>Cardholder: <strong>DEMO CUSTOMER</strong></p>
    <p>Card Number: <strong>4242 4242 4242 4242</strong></p>
    <p>Expiry: <strong>12/30</strong></p>
    <p>CVV: <strong>123</strong></p>
  </div>

  <p className="mt-4 text-xs text-urumaya-ink/55">
    Fictional demonstration values only. Never enter a real card.
  </p>
</div>

    
    <div className="mt-8 space-y-6">
      <Field
        label="Cardholder Name *"
        name="cardholderName"
        value={cardDetails.cardholderName}
        onChange={handleCardChange}
        placeholder="DEMO CUSTOMER"
        autoComplete="off"
        required
      />

      <Field
        label="Card Number *"
        name="cardNumber"
        value={cardDetails.cardNumber}
        onChange={handleCardChange}
        placeholder="4242 4242 4242 4242"
        inputMode="numeric"
        autoComplete="off"
        maxLength={19}
        required
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Expiry Date *"
          name="expiryDate"
          value={cardDetails.expiryDate}
          onChange={handleCardChange}
          placeholder="MM/YY"
          autoComplete="off"
          maxLength={5}
          required
        />

        <Field
          label="CVV *"
          name="cvv"
          value={cardDetails.cvv}
          onChange={handleCardChange}
          placeholder="123"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          required
        />
      </div>
    </div>

    <div className="mt-8 rounded-xl bg-urumaya-ivory p-5">
      <div className="flex justify-between gap-4">
        <span className="text-sm text-urumaya-ink/60">
          Order Number
        </span>
        <span className="text-sm font-semibold text-urumaya-forest">
          {order.orderNumber}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-urumaya-ink/10 pt-5">
        <span className="text-sm text-urumaya-ink/60">
          Amount to Pay
        </span>
        <span className="font-display text-3xl text-urumaya-forest">
          {formatPrice(order.totalAmount)}
        </span>
      </div>
    </div>

    <button
      type="button"
      disabled={processing}
      onClick={() => handlePayment("success")}
      className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-urumaya-terracotta px-6 py-4 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[#CC7050] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LockKeyhole size={16} />
      {processing
        ? "Processing Demo Payment..."
        : `Pay ${formatPrice(order.totalAmount)}`}
      <ArrowRight size={16} />
    </button>

    <button
      type="button"
      disabled={processing}
      onClick={() => handlePayment("failure")}
      className="mt-4 w-full rounded-full border border-urumaya-ink/20 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-urumaya-ink transition hover:bg-urumaya-ivory disabled:opacity-60"
    >
      Simulate Failed Payment
    </button>

    <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-urumaya-ink/50">
      <LockKeyhole size={14} />
      Simulation only — no actual card processing
    </p>
  </div>
)}


            {step === "confirmation" && order && (
              <div className="rounded-[26px] border border-urumaya-ink/10 bg-white p-7 text-center sm:p-12">
                <CheckCircle2
                  size={56}
                  className={
                    order.paymentStatus === "paid"
                      ? "mx-auto text-green-700"
                      : "mx-auto text-urumaya-terracotta"
                  }
                />

                <h2 className="mt-6 font-display text-4xl text-urumaya-forest">
                  {order.paymentStatus === "paid"
                    ? "Your Order Is Confirmed"
                    : "Payment Was Unsuccessful"}
                </h2>

                <p className="mt-5 text-sm leading-7 text-urumaya-ink/65">
                  {order.paymentStatus === "paid"
                    ? "Thank you for supporting Sri Lankan craftsmanship."
                    : "Your order has been cancelled and the reserved stock released."}
                </p>

                <p className="mt-7 text-sm font-semibold text-urumaya-forest">
                  {order.orderNumber}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/shop")}
                  className="mt-9 inline-flex items-center gap-2 rounded-full bg-urumaya-terracotta px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white"
                >
                  Continue Shopping
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          <aside className="uc-summary">
            <CheckoutLeaves className="uc-summary-leaves" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-urumaya-gold">
              Your Selection
            </p>

            <h2 className="mt-4 font-display text-4xl">
              Order Summary
            </h2>

            <div className="mt-8 space-y-5">
              {(order?.items || cartItems).map((item) => (
                <div key={item.productId || item.product} className="uc-summary-item">
                  <div className="uc-product-image">
                    {item.image ? <img src={item.image} alt={item.name} /> : <ShoppingBag size={26} />}
                  </div>
                  <div className="uc-product-info">
                    <p>{item.name}</p>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <strong className="uc-product-price">{formatPrice(item.totalPrice ?? (item.unitPrice ?? item.price) * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-white/60">Subtotal</span>
                <span>
                  {formatPrice(order?.subtotal ?? cartSubtotal)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-white/60">Shipping</span>
                <span>{formatPrice(SHIPPING_FEE)}</span>
              </div>
            </div>

            <div className="my-7 h-px bg-white/20" />

            <div className="uc-total">
              <span className="text-sm">Total</span>
              <span className="font-display text-3xl text-urumaya-gold">
                {formatPrice(order?.totalAmount ?? total)}
              </span>
            </div>

            <p className="mt-8 text-center font-display text-xl italic text-urumaya-gold/85">
              Rooted in Heritage
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
