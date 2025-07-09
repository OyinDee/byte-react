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
    try {
      const storedCart = localStorage.getItem("cart");
      if (!storedCart) return new Map();
      
      const parsedCart = JSON.parse(storedCart);
      // Validate the parsed cart data
      if (!Array.isArray(parsedCart)) return new Map();
      
      // Filter out any invalid entries
      const validEntries = parsedCart.filter(entry => 
        Array.isArray(entry) && 
        entry.length === 2 && 
        Array.isArray(entry[1]) &&
        entry[1].every(item => item && item.meal && item.quantity)
      );
      
      return new Map(validEntries);
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return new Map();
    }
  });

  // Sync cart state with localStorage whenever cart changes
  useEffect(() => {
    try {
      if (cart.size > 0) {
        const validEntries = Array.from(cart.entries()).map(([restaurantId, items]) => [
          restaurantId,
          items.filter(item => item && item.meal && item.quantity)
        ]).filter(([_, items]) => items.length > 0);
        
        if (validEntries.length > 0) {
          localStorage.setItem("cart", JSON.stringify(validEntries));
        } else {
          localStorage.removeItem("cart");
        }
      } else {
        localStorage.removeItem("cart");
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const syncCartFromLocalStorage = () => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (!storedCart) return new Map();
      
      const parsedCart = JSON.parse(storedCart);
      if (!Array.isArray(parsedCart)) return new Map();
      
      const validEntries = parsedCart.filter(entry => 
        Array.isArray(entry) && 
        entry.length === 2 && 
        Array.isArray(entry[1]) &&
        entry[1].every(item => item && item.meal && item.quantity)
      );
      
      return new Map(validEntries);
    } catch (error) {
      console.error('Error syncing cart from localStorage:', error);
      return new Map();
    }
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
        items.push({ meal, quantity, isRequired: meal.required || false });
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
    localStorage.removeItem("cart");
    setCart(prevCart => {
      const newCart = new Map();
      return newCart;
    });
  };

  const getItemCount = () => {
    return Array.from(cart.values())
      .flat()
      .filter((item) => item && item.meal && typeof item.quantity === "number")
      .reduce((count, item) => count + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return Array.from(cart.values())
      .flat()
      .filter(
        (item) =>
          item && item.meal && item.meal.price && typeof item.quantity === "number"
      )
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
