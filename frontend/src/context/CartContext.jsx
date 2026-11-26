
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import { useAuth } from "./AuthContext";
import { cartAPI } from "../api/cart";

const CartContext = createContext(null);

// Default empty cart
const EMPTY_CART = {
  items: [],
  cartCount: 0,
  cartSubtotal: 0,
};

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [cartState, setCartState] = useState({
    owner: null,
    data: EMPTY_CART,
  });

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const isCustomer = user?.role === "customer";

  const customerId = isCustomer
    ? String(user._id || user.id || "")
    : null;

  const sessionRef = useRef(null);
  const busyRef = useRef(false);

  // Load the authenticated customer's cart
  useEffect(() => {
    const session = { customerId };

    sessionRef.current = session;
    busyRef.current = false;

    setCartState({
      owner: customerId,
      data: EMPTY_CART,
    });

    setError("");
    setUpdating(false);

    if (authLoading || !customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadCart = async () => {
      try {
        const response = await cartAPI.getCart();

        if (sessionRef.current === session) {
          setCartState({
            owner: customerId,
            data: response.data.data,
          });
        }
      } catch (err) {
        if (sessionRef.current === session) {
          setError(
            err.response?.data?.message ||
              "Failed to load your shopping cart."
          );
        }
      } finally {
        if (sessionRef.current === session) {
          setLoading(false);
        }
      }
    };

    loadCart();

    return () => {
      if (sessionRef.current === session) {
        sessionRef.current = null;
      }
    };
  }, [customerId, authLoading]);

  // Shared handler for cart modification requests
  const executeCartAction = useCallback(
    async (action) => {
      const session = sessionRef.current;

      if (
        authLoading ||
        !customerId ||
        session?.customerId !== customerId
      ) {
        return false;
      }

      if (busyRef.current || loading) {
        return false;
      }

      busyRef.current = true;
      setUpdating(true);
      setError("");

      try {
        const response = await action();

        if (sessionRef.current !== session) {
          return false;
        }

        setCartState({
          owner: customerId,
          data: response.data.data,
        });

        return true;
      } catch (err) {
        if (sessionRef.current === session) {
          setError(
            err.response?.data?.message ||
              "Unable to update your shopping cart."
          );
        }

        return false;
      } finally {
        if (sessionRef.current === session) {
          busyRef.current = false;
          setUpdating(false);
        }
      }
    },
    [customerId, authLoading, loading]
  );

  // Add a product
  const addToCart = async (product, quantity = 1) => {
    const productId = product?._id;

    if (!productId) {
      setError("Invalid product.");
      return false;
    }

    return executeCartAction(() =>
      cartAPI.addToCart(productId, quantity)
    );
  };

  // Update product quantity
  const updateQuantity = async (productId, quantity) => {
    return executeCartAction(() =>
      cartAPI.updateCartItem(productId, quantity)
    );
  };

  // Remove a product
  const removeFromCart = async (productId) => {
    return executeCartAction(() =>
      cartAPI.removeCartItem(productId)
    );
  };

  // Clear the authenticated customer's cart
  const clearCart = async () => {
    return executeCartAction(() =>
      cartAPI.clearCart()
    );
  };

  // Manually reload the cart from the backend
  const refreshCart = async () => {
    return executeCartAction(() =>
      cartAPI.getCart()
    );
  };

  // Never expose another customer's cart
  const visibleCart =
    !authLoading &&
    customerId &&
    cartState.owner === customerId
      ? cartState.data
      : EMPTY_CART;

  const value = {
    cartItems: visibleCart.items,
    cartCount: visibleCart.cartCount,
    cartSubtotal: visibleCart.cartSubtotal,

    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,

    loading:
      authLoading ||
      loading ||
      Boolean(customerId && cartState.owner !== customerId),

    updating,
    error,
    isCustomer,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }

  return context;
}
