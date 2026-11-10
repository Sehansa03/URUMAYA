
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ==========================================
// CART CONTEXT
// ==========================================

const CartContext = createContext(null);

const CART_STORAGE_KEY = "urumaya_shopping_bag";

// ==========================================
// RESTORE CART FROM LOCAL STORAGE
// ==========================================

function readStoredCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unable to restore shopping bag:", error);
    return [];
  }
}

// ==========================================
// CART PROVIDER
// ==========================================

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(readStoredCart);

  // Save cart whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error("Unable to save shopping bag:", error);
    }
  }, [cartItems]);

  // ==========================================
  // ADD PRODUCT TO CART
  // ==========================================

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?._id) return false;

    const stock = Math.max(
      0,
      Number(product.stockQuantity) || 0
    );

    if (stock === 0) return false;

    const requestedQuantity = Math.max(
      1,
      Math.floor(Number(quantity) || 1)
    );

    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) => item.productId === product._id
      );

      if (existingItem) {
        return previousItems.map((item) =>
          item.productId === product._id
            ? {
                ...item,
                quantity: Math.min(
                  stock,
                  item.quantity + requestedQuantity
                ),
                stockQuantity: stock,
                price: product.price,
              }
            : item
        );
      }

      return [
        ...previousItems,
        {
          productId: product._id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          category: product.category,
          stockQuantity: stock,
          quantity: Math.min(requestedQuantity, stock),
        },
      ];
    });

    return true;
  }, []);

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  const updateQuantity = useCallback((productId, quantity) => {
    setCartItems((previousItems) =>
      previousItems.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        const maxStock = Math.max(
          1,
          Number(item.stockQuantity) || 1
        );

        return {
          ...item,
          quantity: Math.min(
            maxStock,
            Math.max(
              1,
              Math.floor(Number(quantity) || 1)
            )
          ),
        };
      })
    );
  }, []);

  // ==========================================
  // REMOVE PRODUCT FROM CART
  // ==========================================

  const removeFromCart = useCallback((productId) => {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) => item.productId !== productId
      )
    );
  }, []);

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // ==========================================
  // CART ITEM COUNT
  // ==========================================

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cartItems]
  );

  // ==========================================
  // CART SUBTOTAL
  // ==========================================

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  // ==========================================
  // CONTEXT VALUES
  // ==========================================

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      cartSubtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cartItems,
      cartCount,
      cartSubtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
