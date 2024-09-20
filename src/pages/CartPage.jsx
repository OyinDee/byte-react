import React, { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CartPage = () => {
  const [cart, setCart] = useState(new Map());
  const [user, setUser] = useState(null);
  const [note, setNote] = useState(''); 
  const [fee, setFee] = useState(60); 
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("byteUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        setUser(null);
      }
    }

    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsedCart = new Map(JSON.parse(storedCart));
        setCart(parsedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
        setCart(new Map());
      }
    }
  }, []);

  const handleRemoveItem = (restaurantId, mealId) => {

    setCart(prevCart => {
      const newCart = new Map(prevCart);
      const items = newCart.get(restaurantId) || [];
      const updatedItems = items.filter(item => item.meal.customId !== mealId);
  
      if (updatedItems.length > 0) {
        newCart.set(restaurantId, updatedItems);
      } else {
        newCart.delete(restaurantId);
      }
  
      localStorage.setItem("cart", JSON.stringify(Array.from(newCart.entries())));
      toast.success("Item removed from cart!");
      return newCart;
    });
  };
  
  const handleClearCart = (restaurantId) => {
    setCart(prevCart => {
      const newCart = new Map(prevCart);
      newCart.delete(restaurantId);
  
      localStorage.setItem("cart", JSON.stringify(Array.from(newCart.entries())));
      toast.success("Cart cleared successfully!");
      return newCart;
    });
  };
  
  const handleCheckout = async (restaurantId) => {
    if (!user) {
      toast.error("You need to log in first.");
      return;
    }
    
    toast.info("In the kitchen... Wait a minute!");
      setIsCheckoutLoading(true);

      const orderDetails = Array.from(cart.entries()).map(([restaurantId, items]) => ({
        restaurantCustomId: restaurantId,
        meals: items.map(({ meal, quantity }) => ({
        mealId: meal.customId,
        quantity,
      })),
      totalPrice: totalAmountPerRestaurant(items),
      location: user.location,
      phoneNumber: user.phoneNumber,
      user: user._id,
      note, 
      nearestLandmark: user.nearestLandmark || "",
      fee
    }));
  
    try {
      const response = await fetch("https://mongobyte.onrender.com/api/v1/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      });
  
      if (!response.ok) {
        throw new Error("Failed to place the order.");
      }
  
      const data = await response.json();
      console.log(data);
      
      setCart(prevCart => {
        const newCart = new Map(prevCart);

        newCart.delete(restaurantId);

  
        localStorage.setItem("cart", JSON.stringify(Array.from(newCart.entries())));
        return newCart;
      });
  
      toast.success("Order placed successfully!");
      setNote('');
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    }
    finally {
      setIsCheckoutLoading(false); 
    }
  };
  


  const totalAmountPerRestaurant = (items) =>
    items.reduce(
      (sum, item) => sum + (item.meal?.price ?? 0) * (item.quantity ?? 0),
      0
    );

  return (
    <div className="p-4 bg-white min-h-screen mb-20">
      <ToastContainer />
      <div className="max-w-4xl mx-auto text-black">
        <h1 className="text-3xl font-bold text-black mb-6">Your Cart</h1>
        {cart.size === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        ) : (
          Array.from(cart.entries()).map(([restaurantId, items]) => (
            <div
              key={restaurantId}
              className="border-b border-gray-200 mb-8 pb-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-black">
                Restaurant:{" "}
                {items.length > 0 ? items[0].meal.restaurantId : "Unknown"}
              </h2>
              <div className="space-y-4">
                {items.map(({ meal, quantity }) => (
                  <div
                    key={meal.customId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      {meal.imageUrl && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <img
                            src={meal.imageUrl}
                            alt={meal.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          {meal.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-lg font-bold text-black">
                        B{meal.price.toFixed(2)}
                      </p>
                      <button
                        onClick={() =>
                          handleRemoveItem(restaurantId, meal.customId)
                        }
                        className="text-red-500 hover:text-red-700 flex justify-center"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label htmlFor="note" className="text-sm font-medium text-black">
                  Add a note for your order:
                </label>
                <textarea
                  id="note"
                  className="w-full p-1 border border-gray-300 rounded mt-2"
                  rows="3"
                  placeholder="Special requests or preferences"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
             <br/>
                <label htmlFor="note" className="text-xs font-medium text-black">
                  If requested amount (transport plus add ons calculated by restaurants) is within the range of this amount, we'll grant request and debit automatically..
                </label>
             <br/>

                <input type='number'
                  id="fee"
                  placeholder="Add requests and transfer amount in BYTES!"
                  value= {fee}
                  onChange={(e) => setFee(e.target.value)}
                  className='w-full border'
                />
              <div className="flex justify-between items-center mt-4">
                <p className="text-lg font-semibold text-black">
                  Total:{" "}
                  <span className="text-black">
                    B{totalAmountPerRestaurant(items).toFixed(2)}
                  </span>
                </p>
              </div>
              <div className="mt-4 flex space-x-2">
              <button
                  onClick={() => handleCheckout(restaurantId)}
                  className={`w-full bg-black text-white px-6 py-3 rounded hover:bg-gray-800 ${
                    isCheckoutLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isCheckoutLoading} 
                >
                  {isCheckoutLoading ? "Processing..." : "Checkout"}
                </button>
                <button
                  onClick={() => handleClearCart(restaurantId)}
                  className="bg-red-500 text-white px-4 py-3 rounded hover:bg-red-600 flex items-center justify-center"
                >
                  <FaTrashAlt className="" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartPage;
