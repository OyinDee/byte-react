import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SuperAdminDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    email: "",
    description: "",
    location: "",
    contactNumber: "",
    password: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://mongobyte.vercel.app/api/superadmin/restaurants", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurants(response.data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };

    fetchRestaurants();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRestaurant((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return "";
    try {
      const response = await axios.post(
        "https://mongobyte.vercel.app/api/v1/users/upload",
        { image: selectedImage }
      );
      return response.data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleAddRestaurant = async () => {
    try {
      const token = localStorage.getItem("token");
      let imageUrl = "";

      if (selectedImage) {
        imageUrl = await handleImageUpload();
      }

      await axios.post("https://mongobyte.vercel.app/api/superadmin/restaurants", {
        ...newRestaurant,
        imageUrl,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Restaurant added successfully!");
      const response = await axios.get("https://mongobyte.vercel.app/api/superadmin/restaurants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurants(response.data);
      setNewRestaurant({
        name: "",
        email: "",
        description: "",
        location: "",
        contactNumber: "",
        password: "",
        bankName: "",
        accountNumber: "",
        accountHolder: "",
      });
      setSelectedImage(null);
    } catch (error) {
      toast.error("Error adding restaurant!");
      console.error("Error adding restaurant:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-yellow-500">Super Admin Dashboard</h1>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold">Add New Restaurant</h2>
        <input
          type="text"
          name="name"
          value={newRestaurant.name}
          onChange={handleInputChange}
          placeholder="Name"
          className="border p-2 m-2"
        />
        <input
          type="email"
          name="email"
          value={newRestaurant.email}
          onChange={handleInputChange}
          placeholder="Email"
          className="border p-2 m-2"
        />
        <input
          type="text"
          name="description"
          value={newRestaurant.description}
          onChange={handleInputChange}
          placeholder="Description"
          className="border p-2 m-2"
        />
        <input
          type="text"
          name="location"
          value={newRestaurant.location}
          onChange={handleInputChange}
          placeholder="Location"
          className="border p-2 m-2"
        />
        <input
          type="text"
          name="contactNumber"
          value={newRestaurant.contactNumber}
          onChange={handleInputChange}
          placeholder="Contact Number"
          className="border p-2 m-2"
        />
        <input
          type="text"
          name="bankName"
          value={newRestaurant.bankName}
          onChange={handleInputChange}
          placeholder="Bank Name"
          className="border p-2 m-2"
        />
        <input
          type="text"
          name="accountNumber"
          value={newRestaurant.accountNumber}
          onChange={handleInputChange}
          placeholder="Account Number"
          className="border p-2 m-2"
        />
        <input
          type="text"
          name="accountHolder"
          value={newRestaurant.accountHolder}
          onChange={handleInputChange}
          placeholder="Account Holder's Name"
          className="border p-2 m-2"
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          className="border p-2 m-2"
        />
        <button
          onClick={handleAddRestaurant}
          className="bg-yellow-500 text-white p-2 mt-4"
        >
          Add Restaurant
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold">Existing Restaurants</h2>
        <ul>
          {restaurants.map((restaurant) => (
            <li key={restaurant._id} className="border-b py-2">
              <p><strong>Name:</strong> {restaurant.name}</p>
              <p><strong>Email:</strong> {restaurant.email}</p>
              <p><strong>Description:</strong> {restaurant.description}</p>
              <p><strong>Location:</strong> {restaurant.location}</p>
              <p><strong>Contact Number:</strong> {restaurant.contactNumber}</p>
              {restaurant.imageUrl && (
                <img src={restaurant.imageUrl} alt={restaurant.name} className="w-32 h-32 object-cover" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
