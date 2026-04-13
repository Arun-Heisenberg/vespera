import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { CollectionPiece } from "@workspace/api-client-react/src/generated/api.schemas";

export interface CartItem {
  pieceId: number;
  quantity: number;
  piece: CollectionPiece;
}

interface CartContextType {
  items: CartItem[];
  addItem: (piece: CollectionPiece, quantity?: number) => void;
  removeItem: (pieceId: number) => void;
  updateQuantity: (pieceId: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("vespera-cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isSignedIn } = useUser();
  const prevSignedIn = useRef(isSignedIn);

  useEffect(() => {
    if (prevSignedIn.current === true && isSignedIn === false) {
      setItems([]);
      localStorage.removeItem("vespera-cart");
    }
    prevSignedIn.current = isSignedIn;
  }, [isSignedIn]);

  useEffect(() => {
    localStorage.setItem("vespera-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (piece: CollectionPiece, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.pieceId === piece.id);
      if (existing) {
        return current.map((item) =>
          item.pieceId === piece.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { pieceId: piece.id, quantity, piece }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (pieceId: number) => {
    setItems((current) => current.filter((item) => item.pieceId !== pieceId));
  };

  const updateQuantity = (pieceId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(pieceId);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.pieceId === pieceId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.piece.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
