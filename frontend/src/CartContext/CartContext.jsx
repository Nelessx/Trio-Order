import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import axios from "axios";

const API_BASE = "http://localhost:4000";

// --- Context ---
const CartContext = createContext({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalAmount: 0,
});

// --- Helpers ---
const toNumber = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const normalizeArray = (arr) =>
  (Array.isArray(arr) ? arr : []).map((ci) => ({
    _id: ci._id ?? ci.id,                 // cart-line id
    item: ci.item ?? ci.product ?? {},    // item object
    quantity: toNumber(ci.quantity ?? 1),
  })).filter((ci) => ci.item && ci.item._id);

// Accepts many shapes: array, {items:[...]}, {cart:[...]}, {data:[...]}
const normalizeCartPayload = (payload) => {
  if (Array.isArray(payload)) return normalizeArray(payload);
  if (payload?.items) return normalizeArray(payload.items);
  if (payload?.cart) return normalizeArray(payload.cart);
  if (payload?.data) return normalizeArray(payload.data);
  // single cart item case
  if (payload?._id || payload?.item || payload?.product) return normalizeArray([payload]);
  return [];
};

// --- Reducer ---
const cartReducer = (state, action) => {
  switch (action.type) {
    case "HYDRATE_CART": {
      return normalizeCartPayload(action.payload);
    }

    case "ADD_ITEM": {
      // payload must end as {_id?: lineId, item, quantity}
      const { _id, item, quantity } = action.payload;
      const itemId = item?._id;

      // merge by item._id (prevents duplicates even if server returns a new lineId)
      const idx = state.findIndex((ci) => ci.item?._id === itemId);
      if (idx >= 0) {
        const existing = state[idx];
        const updated = {
          ...existing,
          _id: _id || existing._id, // prefer server line id if present
          quantity: toNumber(existing.quantity) + toNumber(quantity, 1),
        };
        return [...state.slice(0, idx), updated, ...state.slice(idx + 1)];
      }
      return [...state, { _id, item, quantity: toNumber(quantity, 1) }];
    }

    case "UPDATE_ITEM": {
      // accept either {_id, quantity} or {lineId, quantity}
      const lineId = action.payload._id ?? action.payload.lineId;
      const nextQty = toNumber(action.payload.quantity, 1);
      return state.map((ci) => (ci._id === lineId ? { ...ci, quantity: nextQty } : ci));
    }

    case "REMOVE_ITEM": {
      const lineId = action.payload;
      return state.filter((ci) => ci._id !== lineId);
    }

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
};

// --- Initializer (safe for SSR) ---
const initializer = () => {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem("cart");
    return normalizeArray(JSON.parse(raw || "[]"));
  } catch {
    return [];
  }
};

// --- Provider ---
export const CartProvider = ({ children }) => {
  const [cartItems, dispatch] = useReducer(cartReducer, [], initializer);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Initial hydrate from API
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    axios
      .get(`${API_BASE}/api/cart`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => dispatch({ type: "HYDRATE_CART", payload: res.data }))
      .catch((err) => {
        // Ignore 401; user just not logged in
        if (err?.response?.status !== 401) console.error(err);
      });
  }, []);

  // Actions (optimistic + resilient to API shapes)
  const addToCart = useCallback(async (item, qty = 1) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    // Handle if item is just an ID string
    const itemObj = typeof item === 'string' ? { _id: item } : item;
    const itemId = itemObj?._id;

    if (!itemId) {
      console.error('addToCart: invalid item', item);
      return;
    }

    console.log('addToCart called with:', { item: itemObj, qty, itemId });

    // optimistic: update immediately using local item info
    // server should return the authoritative state; we reconcile if an array is returned
    try {
      const res = await axios.post(
        `${API_BASE}/api/cart`,
        { itemId, quantity: qty },
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = res?.data;
      console.log('addToCart response:', data);
      
      const hydrated = normalizeCartPayload(data);
      console.log('Hydrated payload:', hydrated);
      
      if (hydrated.length > 1) {
        dispatch({ type: "HYDRATE_CART", payload: data });
      } else if (hydrated.length === 1) {
        // use server line id if provided, but ensure we keep the item details we already have
        const serverLine = hydrated[0];
        console.log('Server line:', serverLine);
        console.log('Using item:', serverLine.item || itemObj);
        
        dispatch({
          type: "ADD_ITEM",
          payload: { 
            _id: serverLine._id, 
            item: serverLine.item || itemObj, 
            quantity: serverLine.quantity || qty 
          },
        });
      } else {
        // fallback: no structured response; still update locally
        console.log('Fallback: using itemObj', itemObj);
        dispatch({ type: "ADD_ITEM", payload: { item: itemObj, quantity: qty } });
      }
    } catch (err) {
      console.error("addToCart failed", err);
      console.error("Error details:", err.response?.data || err.message);
      // if needed, show toast here
    }
  }, []);

  const removeFromCart = useCallback(async (lineId) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    try {
      await axios.delete(`${API_BASE}/api/cart/${lineId}`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      dispatch({ type: "REMOVE_ITEM", payload: lineId });
    } catch (err) {
      console.error("removeFromCart failed", err);
    }
  }, []);

  const updateQuantity = useCallback(async (lineId, qty) => {
    const safeQty = Math.max(1, toNumber(qty, 1));
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    try {
      const res = await axios.put(
        `${API_BASE}/api/cart/${lineId}`,
        { quantity: safeQty },
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = res?.data;
      const hydrated = normalizeCartPayload(data);
      if (hydrated.length > 0 && (Array.isArray(data) || data?.items || data?.cart)) {
        dispatch({ type: "HYDRATE_CART", payload: data });
      } else {
        dispatch({ type: "UPDATE_ITEM", payload: { _id: lineId, quantity: safeQty } });
      }
    } catch (err) {
      console.error("updateQuantity failed", err);
    }
  }, []);

  const clearCart = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    try {
      await axios.post(
        `${API_BASE}/api/cart/clear`,
        {},
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      dispatch({ type: "CLEAR_CART" });
    } catch (err) {
      console.error("clearCart failed", err);
    }
  }, []);

  const totalItems = useMemo(
    () => cartItems.reduce((s, ci) => s + toNumber(ci.quantity, 0), 0),
    [cartItems]
  );

  const totalAmount = useMemo(
    () =>
      cartItems.reduce((s, ci) => {
        const price = toNumber(ci?.item?.price, 0);
        return s + price * toNumber(ci?.quantity, 0);
      }, 0),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount,
      API_BASE,
    }),
    [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);