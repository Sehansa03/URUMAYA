const Cart = require("./cart.model");
const Product = require("../products/product.model");

// ==========================================
// HELPER: GET FORMATTED CUSTOMER CART
// ==========================================

const getFormattedCart = async (customerId) => {
  const cart = await Cart.findOne({
    customer: customerId,
  })
    .populate({
  path: "items.product",
  select:
    "name slug price images category stockQuantity isActive approvalStatus",
  transform: (doc, id) => {
    return doc || { _id: id };
  },
})
.lean();

  if (!cart) {
    return {
      items: [],
      cartCount: 0,
      cartSubtotal: 0,
    };
  }

  const items = cart.items.map((item) => {
    const product = item.product;

    const isAvailable = Boolean(
      product &&
      product.isActive &&
      product.approvalStatus === "published" &&
      product.stockQuantity >= item.quantity
    );

    return {
      productId: product?._id || null,
      slug: product?.slug || "",
      name: product?.name || "Unavailable product",
      price: product?.price || 0,
      image: product?.images?.[0] || "",
      category: product?.category || null,
      stockQuantity: product?.stockQuantity || 0,
      quantity: item.quantity,
      isAvailable,
      totalPrice: (product?.price || 0) * item.quantity,
    };
  });

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartSubtotal = items.reduce(
    (total, item) => total + item.totalPrice,
    0
  );

  return {
    items,
    cartCount,
    cartSubtotal,
  };
};

// ==========================================
// HELPER: HANDLE CART ERRORS
// ==========================================

const handleCartError = (res, error, message) => {
  console.error(message, error);

  if (
    error.name === "VersionError" ||
    error.code === 11000
  ) {
    return res.status(409).json({
      success: false,
      message: "Your cart has changed. Please try again.",
    });
  }

  return res.status(500).json({
    success: false,
    message,
  });
};

// ==========================================
// GET CUSTOMER CART
// GET /api/v1/cart
// ==========================================

const getCart = async (req, res) => {
  try {
    const cart = await getFormattedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    return handleCartError(
      res,
      error,
      "Failed to retrieve cart"
    );
  }
};

// ==========================================
// ADD PRODUCT TO CART
// POST /api/v1/cart/items
// ==========================================

const addToCart = async (req, res) => {
  try {
    const customerId = req.user._id;

    const { productId, quantity } = req.validatedCart;

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
      approvalStatus: "published",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product is unavailable",
      });
    }

    let cart = await Cart.findOne({
      customer: customerId,
    });

    if (!cart) {
      cart = new Cart({
        customer: customerId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.equals(productId)
    );

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (
      !Number.isSafeInteger(newQuantity) ||
      newQuantity > product.stockQuantity
    ) {
      return res.status(409).json({
        success: false,
        message: "Insufficient product stock",
      });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
      });
    }

    await cart.save();

    const formattedCart = await getFormattedCart(customerId);

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: formattedCart,
    });
  } catch (error) {
    return handleCartError(
      res,
      error,
      "Failed to add product to cart"
    );
  }
};

// ==========================================
// UPDATE CART ITEM QUANTITY
// PATCH /api/v1/cart/items/:productId
// ==========================================

const updateCartItem = async (req, res) => {
  try {
    const customerId = req.user._id;

    const { productId } = req.params;
    const { quantity } = req.validatedCart;

    const cart = await Cart.findOne({
      customer: customerId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const cartItem = cart.items.find(
      (item) => item.product.equals(productId)
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
      approvalStatus: "published",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product is unavailable",
      });
    }

    if (quantity > product.stockQuantity) {
      return res.status(409).json({
        success: false,
        message: "Insufficient product stock",
      });
    }

    cartItem.quantity = quantity;

    await cart.save();

    const formattedCart = await getFormattedCart(customerId);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      data: formattedCart,
    });
  } catch (error) {
    return handleCartError(
      res,
      error,
      "Failed to update cart item"
    );
  }
};

// ==========================================
// REMOVE PRODUCT FROM CART
// DELETE /api/v1/cart/items/:productId
// ==========================================

const removeCartItem = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({
      customer: customerId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.equals(productId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    cart.items.splice(itemIndex, 1);

    await cart.save();

    const formattedCart = await getFormattedCart(customerId);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      data: formattedCart,
    });
  } catch (error) {
    return handleCartError(
      res,
      error,
      "Failed to remove cart item"
    );
  }
};

// ==========================================
// CLEAR CUSTOMER CART
// DELETE /api/v1/cart
// ==========================================

const clearCart = async (req, res) => {
  try {
    const customerId = req.user._id;

    const cart = await Cart.findOne({
      customer: customerId,
    });

    if (cart) {
      cart.items = [];

      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        items: [],
        cartCount: 0,
        cartSubtotal: 0,
      },
    });
  } catch (error) {
    return handleCartError(
      res,
      error,
      "Failed to clear cart"
    );
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};