import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? new Map(JSON.parse(storedCart)) : new Map();
  });

  // Sync cart state with localStorage whenever cart changes
  useEffect(() => {
    if (cart.size > 0) {
      localStorage.setItem("cart", JSON.stringify(Array.from(cart.entries())));
    } else {
      localStorage.removeItem("cart"); // Clear localStorage when cart is empty
    }
  }, [cart]);

  const syncCartFromLocalStorage = () => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? new Map(JSON.parse(storedCart)) : new Map();
  };

  const addToCart = (meal, quantity) => {
    if (!meal.restaurantId) {
      return;
    }

    // Sync with localStorage before adding to the cart
    setCart((prevCart) => {
      const updatedCart = syncCartFromLocalStorage(); // Always sync first
      const newCart = new Map(updatedCart);
      const restaurantId = meal.restaurantId;
      const items = newCart.get(restaurantId) || [];
      const existingItem = items.find(
        (item) => item.meal.customId === meal.customId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        items.push({ meal, quantity });
      }

      newCart.set(restaurantId, items);
      return newCart;
    });
  };

  const updateQuantity = (mealId, quantity) => {
    setCart((prevCart) => {
      const updatedCart = syncCartFromLocalStorage(); // Sync with localStorage
      const newCart = new Map(updatedCart);

      for (const [restaurantId, items] of newCart) {
        const updatedItems = items
          .map((item) => {
            if (item.meal.customId === mealId) {
              if (quantity > 0) {
                return { ...item, quantity };
              }
              return null;
            }
            return item;
          })
          .filter((item) => item !== null);

        if (updatedItems.length > 0) {
          newCart.set(restaurantId, updatedItems);
        } else {
          newCart.delete(restaurantId);
        }
      }

      return newCart;
    });
  };

  const removeItem = (mealId) => {
    setCart((prevCart) => {
      const updatedCart = syncCartFromLocalStorage(); // Sync with localStorage
      const newCart = new Map(updatedCart);

      // Loop over each restaurant's items and remove the specific meal
      for (const [restaurantId, items] of newCart) {
        const updatedItems = items.filter(
          (item) => item.meal.customId !== mealId
        );

        if (updatedItems.length > 0) {
          newCart.set(restaurantId, updatedItems);
        } else {
          newCart.delete(restaurantId);
        }
      }

      return newCart;
    });
  };

  const clearCart = () => {
    setCart(new Map());
    localStorage.removeItem("cart"); // Clear localStorage when cart is cleared
  };

  const getItemCount = () => {
    return Array.from(cart.values())
      .flat()
      .reduce((count, item) => count + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return Array.from(cart.values())
      .flat()
      .reduce((total, item) => total + item.meal.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getItemCount,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
