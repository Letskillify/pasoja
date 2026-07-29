import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../components/Firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, writeBatch } from "firebase/firestore";
import { useAuth } from "../components/useAuth";

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- SYNC GUEST DATA ON LOGIN ---
  useEffect(() => {
    if (user) {
      const syncData = async () => {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
        const guestWishlist = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");

        if (guestCart.length > 0) {
          const batch = writeBatch(db);
          guestCart.forEach((item) => {
            const ref = doc(db, "users", user.uid, "cart", item.id);
            batch.set(ref, item);
          });
          await batch.commit();
          localStorage.removeItem("guest_cart");
        }

        if (guestWishlist.length > 0) {
          const batch = writeBatch(db);
          guestWishlist.forEach((item) => {
            const ref = doc(db, "users", user.uid, "wishlist", item.id);
            batch.set(ref, item);
          });
          await batch.commit();
          localStorage.removeItem("guest_wishlist");
        }
      };
      syncData();
    }
  }, [user]);

  // --- REAL-TIME LISTENERS OR LOCAL STORAGE SYNC ---
  useEffect(() => {
    let unsubCart = () => {};
    let unsubWishlist = () => {};

    if (user) {
      unsubCart = onSnapshot(collection(db, "users", user.uid, "cart"), (snapshot) => {
        setCart(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

      unsubWishlist = onSnapshot(collection(db, "users", user.uid, "wishlist"), (snapshot) => {
        setWishlist(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    } else {
      setCart(JSON.parse(localStorage.getItem("guest_cart") || "[]"));
      setWishlist(JSON.parse(localStorage.getItem("guest_wishlist") || "[]"));
      setLoading(false);
    }

    return () => {
      unsubCart();
      unsubWishlist();
    };
  }, [user]);

  const addToCart = async (product, selectedSize = null) => {
    const cartId = selectedSize ? `${product.id}-${selectedSize.size}` : product.id;
    const price = selectedSize?.price || product.price;
    
    const newItem = {
      cartId: cartId,
      id: product.id,
      name: product.name,
      price: price,
      image: product.image || product.images?.[0] || "",
      category: product.category || "",
      size: selectedSize?.size || "",
      addedAt: new Date().toISOString(),
      quantity: 1
    };

    if (user) {
      await setDoc(doc(db, "users", user.uid, "cart", cartId), newItem);
    } else {
      const currentCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      const existing = currentCart.find(i => i.cartId === cartId);
      if (!existing) {
        const updated = [...currentCart, newItem];
        localStorage.setItem("guest_cart", JSON.stringify(updated));
        setCart(updated);
      }
    }
  };

  const removeFromCart = async (cartId) => {
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "cart", cartId));
    } else {
      const currentCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      const updated = currentCart.filter(i => i.cartId !== cartId);
      localStorage.setItem("guest_cart", JSON.stringify(updated));
      setCart(updated);
    }
  };

  const addToWishlist = async (product) => {
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.images?.[0] || "",
      category: product.category || "",
      addedAt: new Date().toISOString()
    };

    if (user) {
      await setDoc(doc(db, "users", user.uid, "wishlist", product.id), newItem);
    } else {
      const currentWish = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");
      const existing = currentWish.find(i => i.id === product.id);
      if (!existing) {
        const updated = [...currentWish, newItem];
        localStorage.setItem("guest_wishlist", JSON.stringify(updated));
        setWishlist(updated);
      }
    }
  };

  const removeFromWishlist = async (id) => {
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "wishlist", id));
    } else {
      const currentWish = JSON.parse(localStorage.getItem("guest_wishlist") || "[]");
      const updated = currentWish.filter(i => i.id !== id);
      localStorage.setItem("guest_wishlist", JSON.stringify(updated));
      setWishlist(updated);
    }
  };

  const updateQuantity = async (cartId, delta) => {
    if (user) {
      const itemRef = doc(db, "users", user.uid, "cart", cartId);
      const existing = cart.find(i => i.cartId === cartId);
      if (existing) {
        const newQty = Math.max(1, (existing.quantity || 1) + delta);
        await setDoc(itemRef, { ...existing, quantity: newQty }, { merge: true });
      }
    } else {
      const currentCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      const updated = currentCart.map(item => {
        if (item.cartId === cartId) {
          return { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) };
        }
        return item;
      });
      localStorage.setItem("guest_cart", JSON.stringify(updated));
      setCart(updated);
    }
  };

  return (
    <StoreContext.Provider value={{ cart, wishlist, loading, addToCart, removeFromCart, updateQuantity, addToWishlist, removeFromWishlist }}>
      {children}
    </StoreContext.Provider>
  );
};
