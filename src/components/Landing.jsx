import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { 
  FaShippingFast, 
  FaShieldAlt, 
  FaDollarSign, 
  FaUtensils, 
  FaMobileAlt, 
  FaHeart, 
  FaArrowRight,
  FaStar,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt
} from "react-icons/fa"; 
import { BRAND_NAME, APP_IMAGES } from "../utils/brandAssets";

// Skeleton Components
const RestaurantCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-card overflow-hidden h-full animate-pulse">
    <div className="h-56 bg-gray-300"></div>
    <div className="p-5">
      <div className="flex justify-between items-center mb-3">
        <div className="h-6 bg-gray-300 rounded w-32"></div>
        <div className="h-4 bg-gray-300 rounded w-12"></div>
      </div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
        <div className="h-8 bg-gray-300 rounded-full w-20"></div>
      </div>
    </div>
  </div>
);

const TestimonialSkeleton = () => (
  <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 animate-pulse">
    <div className="flex items-center mb-6">
      <div className="w-16 h-16 rounded-full bg-gray-300 mr-4"></div>
      <div>
        <div className="h-5 bg-gray-300 rounded w-20 mb-2"></div>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    </div>
  </div>
);

// Lazy Image Component
const LazyImage = ({ src, alt, className, onError, fallbackSrc }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setImageLoading(false);
    };
    img.onerror = () => {
      if (fallbackSrc) {
        setImageSrc(fallbackSrc);
      } else {
        setImageError(true);
      }
      setImageLoading(false);
    };
    img.src = src;
  }, [src, fallbackSrc]);

  if (imageLoading) {
    return <div className={`${className} bg-gray-300 animate-pulse`}></div>;
  }

  if (imageError && !fallbackSrc) {
    return <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-500`}>
      Image not available
    </div>;
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className} 
      onError={onError}
    />
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    
    // Simulate testimonials loading
    setTimeout(() => {
      setTestimonialsLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.user) {
          navigate("/user");
        }
        if (decodedToken.restaurant) {
          navigate("/restaurant/dashboard");
        }
      } catch (error) {
        // Handle error if needed
      }
    }
  }, [navigate]);

  // Fetch restaurants from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('https://mongobyte.vercel.app/api/v1/restaurants');
        if (response.ok) {
          const data = await response.json();
          // Get 3 random restaurants
          const shuffled = data.sort(() => 0.5 - Math.random());
          setRestaurants(shuffled.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        // Fallback to empty array if API fails
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    fade: true,
    arrows: false,
    swipe: false,
    touchMove: false,
    draggable: false,
    accessibility: false,
    cssEase: "ease-in-out",
    lazyLoad: 'ondemand',
    adaptiveHeight: false,
    appendDots: dots => (
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <ul className="flex space-x-2"> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <div className="w-3 h-3 rounded-full bg-white/30 transition-all duration-300"></div>
    )
  };

  const testimonials = [
    {
      name: "Sarah J.",
      text: "Byte has been a lifesaver during exam week! The food arrives hot and fresh every time.",
      image: "https://randomuser.me/api/portraits/women/12.jpg",
      rating: 5
    },
    {
      name: "David T.",
      text: "I love how easy it is to order. The UI is so intuitive, and I can track my delivery in real-time!",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5
    },
    {
      name: "Michelle L.",
      text: "As a student, I appreciate the affordable prices and quick delivery. Highly recommend!",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 4
    },
  ];

  return (
    <main className="overflow-x-hidden max-w-full">
      {/* Hero Section - Full height starting from top */}
      <section className="relative h-screen overflow-hidden max-w-full carousel-container">
        <Slider {...carouselSettings} className="h-full w-full max-w-full carousel-section">
          <div className="relative h-screen">
            <LazyImage
              src={APP_IMAGES.hero}
              alt="Delicious food"
              className="object-cover w-full h-full"
              fallbackSrc="/placeholder-food.jpg"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent flex flex-col justify-center items-start px-6 md:px-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="max-w-2xl"
              >
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight font-secondary">
                  Campus Cravings <br />
                  <span className="text-cheese">Delivered Fast</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-8 font-sans">
                  The premier food delivery app for university students. Order from campus restaurants and get your meals delivered right to your dorm or study spot.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/login"
                    className="bg-cheese text-crust px-8 py-3 rounded-full text-lg font-medium transition duration-300 flex items-center justify-center shadow-lg font-sans"
                  >
                    Order Now <FaArrowRight className="ml-2" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/signup"
                    className="bg-pepperoni text-white px-8 py-3 rounded-full text-lg font-medium transition duration-300 flex items-center justify-center shadow-lg font-sans"
                  >
                    Sign Up
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="relative h-screen">
            <LazyImage
              src={APP_IMAGES.food1}
              alt="Delicious food"
              className="object-cover w-full h-full"
              fallbackSrc="/placeholder-food.jpg"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent flex flex-col justify-center items-start px-6 md:px-20">
              <div className="max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight font-secondary">
                  Student Life <br />
                  <span className="text-cheese">Made Easier</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-8 font-sans">
                  Choose from a wide variety of local restaurants and cuisines.
                </p>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/signup"
                  className="bg-cheese text-crust px-8 py-3 rounded-full text-lg font-medium transition duration-300 inline-flex items-center shadow-lg font-sans"
                >
                  Get Started <FaArrowRight className="ml-2" />
                </motion.a>
              </div>
            </div>
          </div>
          
          <div className="relative h-screen">
            <LazyImage
              src={APP_IMAGES.food2}
              alt="Delicious food"
              className="object-cover w-full h-full"
              fallbackSrc="/placeholder-food.jpg"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent flex flex-col justify-center items-start px-6 md:px-20">
              <div className="max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight font-secondary">
                  Student Special <br />
                  <span className="text-cheese">Discounts & Deals</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-8 font-sans">
                  Enjoy exclusive discounts and offers designed for students.
                </p>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/login"
                  className="bg-cheese text-crust px-8 py-3 rounded-full text-lg font-medium transition duration-300 inline-flex items-center shadow-lg font-sans"
                >
                  See Offers <FaArrowRight className="ml-2" />
                </motion.a>
              </div>
            </div>
          </div>
        </Slider>
        
        {/* Food floating elements */}
        <motion.div
          className="hidden lg:block absolute bottom-20 right-20 z-10"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
        >
          <LazyImage 
            src={APP_IMAGES.burger} 
            alt="Burger" 
            className="w-24 h-24 object-cover rounded-full shadow-xl border-2 border-white" 
          />
        </motion.div>
        
        <motion.div
          className="hidden lg:block absolute top-40 right-40 z-10"
          animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: 1 }}
        >
          <LazyImage 
            src={APP_IMAGES.friedChicken} 
            alt="Chicken" 
            className="w-20 h-20 object-cover rounded-full shadow-xl border-2 border-white" 
          />
        </motion.div>
        
        <motion.div
          className="hidden lg:block absolute top-60 right-80 z-10"
          animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
        >
          <LazyImage 
            src={APP_IMAGES.jollofRice} 
            alt="Jollof Rice" 
            className="w-16 h-16 object-cover rounded-full shadow-xl border-2 border-white" 
          />
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-crust font-secondary" data-aos="fade-up">
            How It <span className="text-pepperoni">Works</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="relative" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-white p-8 rounded-2xl shadow-card relative z-10 h-full transform transition-all duration-300 hover:translate-y-[-8px]">
                <div className="w-16 h-16 bg-pepperoni rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
                  1
                </div>
                <h3 className="text-xl font-bold mb-4 text-center font-secondary">Browse Restaurants</h3>
                <p className="text-gray-600 text-center font-sans">
                  Explore a variety of restaurants and cuisines available near you.
                </p>
              </div>
              <div className="absolute top-1/2 left-full w-full h-2 bg-cheese hidden md:block" style={{ width: '50%' }}></div>
            </div>
            
            <div className="relative" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-white p-8 rounded-2xl shadow-card relative z-10 h-full transform transition-all duration-300 hover:translate-y-[-8px]">
                <div className="w-16 h-16 bg-pepperoni rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
                  2
                </div>
                <h3 className="text-xl font-bold mb-4 text-center font-secondary">Place Your Order</h3>
                <p className="text-gray-600 text-center">
                  Select your favorite meals and checkout with just a few taps.
                </p>
              </div>
              <div className="absolute top-1/2 left-full w-full h-2 bg-cheese hidden md:block" style={{ width: '50%' }}></div>
            </div>
            
            <div className="relative" data-aos="fade-up" data-aos-delay="300">
              <div className="bg-white p-8 rounded-2xl shadow-card relative z-10 h-full transform transition-all duration-300 hover:translate-y-[-8px]">
                <div className="w-16 h-16 bg-pepperoni rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
                  3
                </div>
                <h3 className="text-xl font-bold mb-4 text-center font-secondary">Enjoy Your Meal</h3>
                <p className="text-gray-600 text-center">
                  Track your order in real-time and enjoy your delicious meal when it arrives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section id="restaurants" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center text-crust font-secondary" data-aos="fade-up">
            Featured <span className="text-pepperoni">Restaurants</span>
          </h2>
          <p className="text-gray-600 text-center mb-16 max-w-3xl mx-auto font-sans" data-aos="fade-up">
            Discover our most popular restaurants with the best ratings and fastest delivery times
          </p>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} data-aos="fade-up" data-aos-delay={100 * (index + 1)}>
                  <RestaurantCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant._id}
                  className="group"
                  data-aos="fade-up"
                  data-aos-delay={100 * (index + 1)}
                  whileHover={{ y: -10 }}
                >
                  <div className="bg-white rounded-2xl shadow-card overflow-hidden transition-all duration-300 h-full">
                    <div className="relative h-56 overflow-hidden">
                      <LazyImage
                        src={restaurant.imageUrl || APP_IMAGES.burger}
                        alt={restaurant.name}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                        fallbackSrc={APP_IMAGES.burger}
                        onError={(e) => {
                          e.target.src = APP_IMAGES.burger;
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <span className="text-white font-medium px-3 py-1 rounded-full bg-pepperoni/80 text-sm font-sans">
                          {restaurant.isActive ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold text-crust font-secondary">{restaurant.name}</h3>
                        <div className="flex items-center text-cheese">
                          <FaStar />
                          <span className="ml-1 text-crust font-sans">{(4.2 + Math.random() * 0.8).toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 font-sans line-clamp-2">
                        {restaurant.description || 'Delicious meals delivered fresh to your doorstep'}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm font-sans">{restaurant.location}</span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-cheese text-crust rounded-full text-sm font-medium font-sans"
                        >
                          View Menu
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/login"
              className="inline-flex items-center px-8 py-3 bg-pepperoni text-white rounded-full font-medium shadow-lg font-sans"
            >
              See All Restaurants <FaArrowRight className="ml-2" />
            </motion.a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-pepperoni/5 to-cheese/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-crust font-secondary" data-aos="fade-up">
            Why Choose <span className="text-pepperoni">{BRAND_NAME}</span>
          </h2>
          <p className="text-gray-600 text-center mb-16 max-w-3xl mx-auto font-sans" data-aos="fade-up">
            We're not just another food delivery app. Here's what makes us different.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="group"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] h-full">
                <div className="bg-pepperoni/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-pepperoni/20 transition-all duration-300">
                  <FaShippingFast className="h-10 w-10 text-pepperoni" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-crust">Fast Delivery</h3>
                <p className="text-gray-600">
                  Get your food delivered fast and hot by fellow students or professional delivery services.
                </p>
              </div>
            </div>
            
            <div
              className="group"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] h-full">
                <div className="bg-pepperoni/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-pepperoni/20 transition-all duration-300">
                  <FaShieldAlt className="h-10 w-10 text-pepperoni" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-crust">Secure & Reliable</h3>
                <p className="text-gray-600">
                  Our tamper-proof packaging and real-time tracking ensure your food arrives safe and secure.
                </p>
              </div>
            </div>
            
            <div
              className="group"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] h-full">
                <div className="bg-pepperoni/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-pepperoni/20 transition-all duration-300">
                  <FaDollarSign className="h-10 w-10 text-pepperoni" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-crust">Earn Extra Income</h3>
                <p className="text-gray-600">
                  Earn extra cash by delivering food to fellow students in your free time - flexible and rewarding.
                </p>
              </div>
            </div>
            
            <div
              className="group"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] h-full">
                <div className="bg-pepperoni/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-pepperoni/20 transition-all duration-300">
                  <FaUtensils className="h-10 w-10 text-pepperoni" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-crust">Wide Selection</h3>
                <p className="text-gray-600">
                  Choose from a diverse range of restaurants, cuisines, and dietary options to satisfy any craving.
                </p>
              </div>
            </div>
            
            <div
              className="group"
              data-aos="fade-up"
              data-aos-delay="500"
            >
              <div className="bg-gradient-to-br from-pepperoni to-pepperoni/80 p-8 rounded-2xl shadow-card border border-gray-100 transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] h-full text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cheese/20 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-cheese/10 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="relative z-10">
                  <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-all duration-300">
                    <FaMobileAlt className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white text-center">
                    <span className="block text-cheese text-3xl">Byte!</span>
                    Mobile App Coming Soon
                  </h3>
                  <p className="text-white/90 text-center leading-relaxed">
                    Get ready for the ultimate campus food delivery experience! Our mobile app will make ordering even easier.
                  </p>
                  <div className="mt-6 text-center">
                    <span className="inline-block px-4 py-2 bg-cheese text-crust rounded-full text-sm font-bold">
                      Stay Tuned! 📱
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div
              className="group"
              data-aos="fade-up"
              data-aos-delay="600"
            >
              <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] h-full">
                <div className="bg-pepperoni/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-pepperoni/20 transition-all duration-300">
                  <FaHeart className="h-10 w-10 text-pepperoni" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-crust">Exclusive Deals</h3>
                <p className="text-gray-600">
                  Enjoy special discounts, loyalty rewards, and exclusive promotions only available to our users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center text-crust font-secondary" data-aos="fade-up">
            What Our Users <span className="text-pepperoni">Say</span>
          </h2>
          <p className="text-gray-600 text-center mb-16 max-w-3xl mx-auto font-sans" data-aos="fade-up">
            Don't just take our word for it. Here's what our satisfied customers have to say about {BRAND_NAME}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsLoading ? (
              [...Array(3)].map((_, index) => (
                <div key={index} data-aos="fade-up" data-aos-delay={100 * (index + 1)}>
                  <TestimonialSkeleton />
                </div>
              ))
            ) : (
              testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-card border border-gray-100"
                  data-aos="fade-up"
                  data-aos-delay={100 * (index + 1)}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-6">
                    <LazyImage
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-cheese"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-crust font-secondary">{testimonial.name}</h3>
                      <div className="flex text-cheese mt-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < testimonial.rating ? "text-cheese" : "text-gray-300"} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4 font-sans">"{testimonial.text}"</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-pepperoni/5 to-cheese/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 mb-10 md:mb-0" data-aos="fade-right">
              <div className="relative">
                <div className="absolute inset-0 bg-pepperoni/10 rounded-2xl transform rotate-3"></div>
                <LazyImage 
                  src={APP_IMAGES.hero} 
                  alt="About Byte" 
                  className="relative z-10 rounded-2xl shadow-xl max-w-full h-auto"
                />
              </div>
            </div>
            
            <div className="w-full md:w-1/2 md:pl-16" data-aos="fade-left">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-crust font-secondary">
                About <span className="text-pepperoni">Us</span>
              </h2>
              
              <p className="text-lg text-gray-700 mb-6 font-sans">
                At {BRAND_NAME}, we're passionate about making food ordering and delivery seamless for university students. 
                Our platform connects you to a variety of restaurants with just a few clicks.
              </p>
              
              <p className="text-lg text-gray-700 mb-8 font-sans">
                Founded by students who understood the challenges of campus dining, {BRAND_NAME} was created to solve real problems: 
                limited dining options, inflexible meal plans, and the need for convenient, affordable food delivery.
              </p>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/signup"
                className="bg-pepperoni text-white px-8 py-3 rounded-full text-lg font-medium transition duration-300 inline-flex items-center shadow-lg font-sans"
              >
                Join Us Today <FaArrowRight className="ml-2" />
              </motion.a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center text-crust font-secondary" data-aos="fade-up">
            Get In <span className="text-pepperoni">Touch</span>
          </h2>
          <p className="text-gray-600 text-center mb-16 max-w-3xl mx-auto font-sans" data-aos="fade-up">
            Have questions or feedback? We'd love to hear from you!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 text-center"
              data-aos="fade-up"
              data-aos-delay="100"
              whileHover={{ y: -5 }}
            >
              <div className="bg-cheese/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaEnvelope className="h-8 w-8 text-pepperoni" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-crust font-secondary">Email Us</h3>
              <p className="text-gray-600 mb-4 font-sans">We'll respond within 24 hours</p>
              <a href="mailto:byte.chows@gmail.com" className="text-pepperoni font-medium font-sans">byte.chows@gmail.com</a>
            </motion.div>
            
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 text-center"
              data-aos="fade-up"
              data-aos-delay="200"
              whileHover={{ y: -5 }}
            >
              <div className="bg-cheese/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaMapMarkerAlt className="h-8 w-8 text-pepperoni" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-crust font-secondary">Connect With Us</h3>
              <p className="text-gray-600 mb-4 font-sans">Campus-focused startup</p>
              <address className="text-gray-600 not-italic font-sans">
                Serving Universities<br />
                Across Nigeria<br />
                Remote-First Team
              </address>
            </motion.div>
            
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 text-center"
              data-aos="fade-up"
              data-aos-delay="300"
              whileHover={{ y: -5 }}
            >
              <div className="bg-cheese/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaPhoneAlt className="h-8 w-8 text-pepperoni" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-crust font-secondary">Call Us</h3>
              <p className="text-gray-600 mb-4 font-sans">Mon-Fri, 9am-5pm</p>
              <a href="tel:+2348086321931" className="text-pepperoni font-medium font-sans">+234 808 632 1931</a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 pb-32 bg-gradient-to-r from-pepperoni to-crust mb-0">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white font-secondary" data-aos="fade-up">
              Ready to Order Delicious Food?
            </h2>
            
            <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto font-sans" data-aos="fade-up" data-aos-delay="100">
              Join thousands of students enjoying convenient food delivery on campus.
              Sign up today and get your first delivery fee waived!
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6" data-aos="fade-up" data-aos-delay="200">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/signup"
                className="bg-cheese text-crust px-10 py-4 rounded-full text-xl font-medium transition duration-300 w-full sm:w-auto shadow-lg font-sans"
              >
                Sign Up Free
              </motion.a>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/login"
                className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full text-xl font-medium hover:bg-white hover:text-pepperoni transition duration-300 w-full sm:w-auto font-sans"
              >
                Login
              </motion.a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Mobile Bottom Spacing */}
      <div className="h-24 md:h-0"></div>
    </main>
  );
};

export default Landing;
