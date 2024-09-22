import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Loader Component
const Loader = () => (
  <div className="flex justify-center items-center">
    <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-black"></div>
  </div>
);

const MealsPage = () => {
  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    tag: "regular",
    price: "",
    imageUrl: "",
    availability: true,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMeals, setLoadingMeals] = useState(false); 
  const [isEditing, setIsEditing] = useState(false);
  const [editingMealId, setEditingMealId] = useState(null);

  const handleDelete = async (customId) => {
    if (window.confirm("Delete meal?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`https://mongobyte.onrender.com/api/v1/meals/${customId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeals(meals.filter((meal) => meal.customId !== customId));
        toast.success("Meal deleted successfully!");
      } catch (error) {
        toast.error("Error deleting meal!");
      }
    }
  };

  const handleEdit = (meal) => {
    setForm({
      name: meal.name,
      description: meal.description || "",
      tag: meal.tag || "regular",
      price: meal.price.toString(),
      imageUrl: meal.imageUrl || "",  
      availability: meal.availability,
    });
    setSelectedImage(null);  
    setEditingMealId(meal.customId);
    setIsEditing(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      const customId = decodedToken.restaurant.customId;
      const fetchMeals = async () => {
        setLoadingMeals(true);  
        try {
          const response = await axios.get(
            `https://mongobyte.onrender.com/api/v1/restaurants/mymeals/${customId}`
          );
          setMeals(response.data);
        } catch (error) {
          toast.error("Error fetching meals!");
        }
        setLoadingMeals(false); 
      };
      fetchMeals();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (base64Image) => {
    try {
      const response = await axios.post("https://mongobyte.onrender.com/api/v1/users/upload", {
        image: base64Image,
      });
      return response.data.url;
    } catch (error) {
      toast.error("Error uploading image!");
      throw error;
    }
  };

  const handleFormSubmit = async (e) => {

    e.preventDefault();
    setIsLoading(true);
    try {
      let imageUrl = form.imageUrl;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);  
      }
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const customId = decodedToken.restaurant.customId;

      if (isEditing && editingMealId) {
        await axios.put(
          `https://mongobyte.onrender.com/api/v1/meals/${editingMealId}`,
          {
            ...form,
            price: Number(form.price),
            imageUrl,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMeals(
          meals.map((meal) =>
            meal.customId === editingMealId
              ? { ...meal, ...form, imageUrl, price: Number(form.price) }
              : meal
          )
        );
        setIsEditing(false);
        setEditingMealId(null);
        toast.success("Meal updated successfully!");
      } else {
        const response = await axios.post(
          `https://mongobyte.onrender.com/api/v1/meals/${customId}/create`,
          {
            ...form,
            price: Number(form.price),
            imageUrl,
          }
        );
        setMeals([...meals, response.data.meal]);
        toast.success("Meal added successfully!");
      }
      setForm({
        name: "",
        description: "",
        tag: "regular",
        price: "",
        imageUrl: "",
        availability: true,
      });
      setSelectedImage(null);
    } catch (error) {
      toast.error("Error saving meal!");
    }
    setIsLoading(false);
  };

  const toggleAvailability = async (meal) => {
    toast.info("Wait...")
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://mongobyte.onrender.com/api/v1/meals/${meal.customId}`,
        { availability: !meal.availability },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeals(
        meals.map((m) =>
          m.customId === meal.customId ? { ...m, availability: !m.availability } : m
        )
      );
      toast.success(`Meal marked as ${meal.availability ? "Unavailable" : "Available"}!`);
    } catch (error) {
      toast.error("Failed to update availability!");
    }
  };

  return (
    <div className="p-4 bg-white text-black min-h-screen pb-20"> 
      <div className="max-w-xl mx-auto pb-20">
        <h2 className="text-xl font-semibold mb-4"> {isEditing ? "Update Meal" : "Add New Meal"}</h2>
        <form onSubmit={handleFormSubmit} className="p-4 rounded-lg">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            required
            className="w-full mb-2 p-2 border rounded bg-white text-black" 
            placeholder="Name"
          />
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            className="w-full mb-2 p-2 border rounded bg-white text-black"
            placeholder="Description"
          />
          <select
            name="tag"
            value={form.tag}
            onChange={handleInputChange}
            className="w-full mb-2 p-2 border rounded bg-white text-black"
          >
            <option value="combo">Combo</option>
            <option value="add-on">Add-On</option>
            <option value="regular">Regular</option>
          </select>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleInputChange}
            required
            className="w-full mb-2 p-2 border rounded bg-white text-black"
            placeholder="Price (B)"
          />
          <select
            name="availability"
            value={form.availability ? "true" : "false"}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                availability: e.target.value === "true",
              }))
            }
            className="w-full mb-2 p-2 border rounded bg-white text-black"
          >
            <option value="true">Available</option>
            <option value="false">Not Available</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full mb-2 p-2 border rounded bg-white text-black"
          />
          {selectedImage && <img src={selectedImage} alt="Selected Meal" className="w-full mb-4" />}
          {!selectedImage && form.imageUrl && <img src={form.imageUrl} alt="Meal" className="w-full mb-4" />}
          
          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : isEditing ? "Update Meal" : "Add Meal"}
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">My Meals</h2>
        {loadingMeals ? <Loader /> : (
          <ul className="space-y-4">
            {meals.map((meal) => (
              <li key={meal.customId} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">{meal.name}</h3>
                    <p>{meal.description}</p>
                    <p>Price: B{meal.price}</p>
                    <p>Tag: {meal.tag}</p>
                    <p>Availability: {meal.availability ? "Available" : "Not Available"}</p>
                  </div>
                </div>
                <img src={meal.imageUrl || selectedImage} alt={meal.name} className="w-full mt-4" />
                  <div className="flex justify-center my-2">
                    <button
                      className={`bg-black py-1 px-4 text-${meal.availability ? "red" : "green"}-500 mr-2`}
                      onClick={() => toggleAvailability(meal)}
                    >
                      {meal.availability ? "Mark as Unavailable" : "Mark as Available"}
                    </button>
                    <button
                      className="bg-black py-2 px-4  text-white mr-2"
                      onClick={() => handleEdit(meal)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-black py-2 px-4 text-red-500 mr-2"
                      onClick={() => handleDelete(meal.customId)}
                    >
                      Delete
                    </button>
                  </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MealsPage;
