import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Slider from "react-slick";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaShippingFast, FaShieldAlt, FaDollarSign } from "react-icons/fa"; 

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
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

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="relative overflow-hidden h-96">
        <Slider {...carouselSettings} className="w-full h-full relative">
          <div className="relative w-full h-96">
            <img
              src="/Images/start.jpg"
              alt="Delicious food 1"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="relative w-full h-96">
            <img
              src="/Images/1.jpg"
              alt="Delicious food 2"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="relative w-full h-96">
            <img
              src="/Images/2.jpg"
              alt="Delicious food 3"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="relative w-full h-96">
            <img
              src="/Images/3.jpg"
              alt="Delicious food 4"
              className="object-cover w-full h-full"
            />
          </div>
        </Slider>
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-center px-6 py-8 lg:px-12 lg:py-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 lg:mb-8 shadow-md">
            Byte!
          </h1>
          <a
            href="/login"
            className="bg-white text-black px-6 py-3 rounded-full text-lg hover:bg-gray-100 font-bold transition"
          >
            Grab One
          </a>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12 text-black" data-aos="fade-up">
            Why Choose Us?
          </h2>
          <div className="flex flex-wrap justify-center">
            <div
              className="w-full md:w-1/3 px-4 mb-8"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="bg-gray-200 p-8 rounded-lg shadow-lg border border-gray-300">
                <FaShippingFast className="h-12 w-12 text-black mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4 text-black">Fast Delivery</h3>
                <p className="text-gray-600">
                  Get your food delivered fast and hot by fellow students or by logistics.
                </p>
              </div>
            </div>
            <div
              className="w-full md:w-1/3 px-4 mb-8"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="bg-gray-200 p-8 rounded-lg shadow-lg border border-gray-300">
                <FaShieldAlt className="h-12 w-12 text-black mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4 text-black">Secure</h3>
                <p className="text-gray-600">
                  You don't need to worry about your meal being tampered with!
                </p>
              </div>
            </div>
            <div
              className="w-full md:w-1/3 px-4 mb-8"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="bg-gray-200 p-8 rounded-lg shadow-lg border border-gray-300">
                <FaDollarSign className="h-12 w-12 text-black mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4 text-black">Earn Extra Money</h3>
                <p className="text-gray-600">
                  Earn extra cash by picking up food orders and delivering them to your fellow students.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2
            className="text-3xl font-bold mb-8 text-center text-black"
            data-aos="fade-up"
          >
            About Us
          </h2>
          <p className="text-lg text-black text-center mb-8" data-aos="fade-up">
            At Byte, we're passionate about making food ordering and
            delivery seamless for university students. Our platform connects you
            to a variety of restaurants with just a few clicks, and our
            student-run delivery service ensures you get your meals fast and
            fresh.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Landing;
