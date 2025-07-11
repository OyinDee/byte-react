import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingPage from "./Loader"; 
import { BRAND_NAME } from "../utils/brandAssets";
import { useUniversities } from "../context/universitiesContext";
import { toast } from "react-toastify";

// Country codes data with Nigeria at the top
const countryCodes = [
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "Afghanistan", code: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "+213", flag: "🇩🇿" },
  { name: "Andorra", code: "+376", flag: "🇦🇩" },
  { name: "Angola", code: "+244", flag: "🇦🇴" },
  { name: "Argentina", code: "+54", flag: "🇦🇷" },
  { name: "Armenia", code: "+374", flag: "🇦🇲" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "+43", flag: "🇦🇹" },
  { name: "Azerbaijan", code: "+994", flag: "🇦🇿" },
  { name: "Bahamas", code: "+1-242", flag: "🇧🇸" },
  { name: "Bahrain", code: "+973", flag: "🇧🇭" },
  { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { name: "Barbados", code: "+1-246", flag: "🇧🇧" },
  { name: "Belarus", code: "+375", flag: "🇧🇾" },
  { name: "Belgium", code: "+32", flag: "🇧🇪" },
  { name: "Belize", code: "+501", flag: "🇧🇿" },
  { name: "Benin", code: "+229", flag: "🇧🇯" },
  { name: "Bhutan", code: "+975", flag: "🇧🇹" },
  { name: "Bolivia", code: "+591", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", code: "+387", flag: "🇧🇦" },
  { name: "Botswana", code: "+267", flag: "🇧🇼" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Brunei", code: "+673", flag: "🇧🇳" },
  { name: "Bulgaria", code: "+359", flag: "🇧🇬" },
  { name: "Burkina Faso", code: "+226", flag: "🇧🇫" },
  { name: "Burundi", code: "+257", flag: "🇧🇮" },
  { name: "Cambodia", code: "+855", flag: "🇰🇭" },
  { name: "Cameroon", code: "+237", flag: "🇨🇲" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Chad", code: "+235", flag: "🇹🇩" },
  { name: "Chile", code: "+56", flag: "🇨🇱" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "Colombia", code: "+57", flag: "🇨🇴" },
  { name: "Comoros", code: "+269", flag: "🇰🇲" },
  { name: "Costa Rica", code: "+506", flag: "🇨🇷" },
  { name: "Croatia", code: "+385", flag: "🇭🇷" },
  { name: "Cuba", code: "+53", flag: "🇨🇺" },
  { name: "Cyprus", code: "+357", flag: "🇨🇾" },
  { name: "Czech Republic", code: "+420", flag: "🇨🇿" },
  { name: "Denmark", code: "+45", flag: "🇩🇰" },
  { name: "Djibouti", code: "+253", flag: "🇩🇯" },
  { name: "Dominican Republic", code: "+1-809", flag: "🇩🇴" },
  { name: "Ecuador", code: "+593", flag: "🇪🇨" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "El Salvador", code: "+503", flag: "🇸🇻" },
  { name: "Estonia", code: "+372", flag: "🇪🇪" },
  { name: "Ethiopia", code: "+251", flag: "🇪🇹" },
  { name: "Fiji", code: "+679", flag: "🇫🇯" },
  { name: "Finland", code: "+358", flag: "🇫🇮" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Gabon", code: "+241", flag: "🇬🇦" },
  { name: "Gambia", code: "+220", flag: "🇬🇲" },
  { name: "Georgia", code: "+995", flag: "🇬🇪" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "Greece", code: "+30", flag: "🇬🇷" },
  { name: "Grenada", code: "+1-473", flag: "🇬🇩" },
  { name: "Guatemala", code: "+502", flag: "🇬🇹" },
  { name: "Guinea", code: "+224", flag: "🇬🇳" },
  { name: "Guyana", code: "+592", flag: "🇬🇾" },
  { name: "Haiti", code: "+509", flag: "🇭🇹" },
  { name: "Honduras", code: "+504", flag: "🇭🇳" },
  { name: "Hungary", code: "+36", flag: "🇭🇺" },
  { name: "Iceland", code: "+354", flag: "🇮🇸" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { name: "Iran", code: "+98", flag: "🇮🇷" },
  { name: "Iraq", code: "+964", flag: "🇮🇶" },
  { name: "Ireland", code: "+353", flag: "🇮🇪" },
  { name: "Israel", code: "+972", flag: "🇮🇱" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Jamaica", code: "+1-876", flag: "🇯🇲" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Jordan", code: "+962", flag: "🇯🇴" },
  { name: "Kazakhstan", code: "+7", flag: "🇰🇿" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Kiribati", code: "+686", flag: "🇰🇮" },
  { name: "Kuwait", code: "+965", flag: "🇰🇼" },
  { name: "Kyrgyzstan", code: "+996", flag: "🇰🇬" },
  { name: "Laos", code: "+856", flag: "🇱🇦" },
  { name: "Latvia", code: "+371", flag: "🇱🇻" },
  { name: "Lebanon", code: "+961", flag: "🇱🇧" },
  { name: "Lesotho", code: "+266", flag: "🇱🇸" },
  { name: "Liberia", code: "+231", flag: "🇱🇷" },
  { name: "Libya", code: "+218", flag: "🇱🇾" },
  { name: "Liechtenstein", code: "+423", flag: "🇱🇮" },
  { name: "Lithuania", code: "+370", flag: "🇱🇹" },
  { name: "Luxembourg", code: "+352", flag: "🇱🇺" },
  { name: "Madagascar", code: "+261", flag: "🇲🇬" },
  { name: "Malawi", code: "+265", flag: "🇲🇼" },
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { name: "Maldives", code: "+960", flag: "🇲🇻" },
  { name: "Mali", code: "+223", flag: "🇲🇱" },
  { name: "Malta", code: "+356", flag: "🇲🇹" },
  { name: "Mauritania", code: "+222", flag: "🇲🇷" },
  { name: "Mauritius", code: "+230", flag: "🇲🇺" },
  { name: "Mexico", code: "+52", flag: "🇲🇽" },
  { name: "Moldova", code: "+373", flag: "🇲🇩" },
  { name: "Monaco", code: "+377", flag: "🇲🇨" },
  { name: "Mongolia", code: "+976", flag: "🇲🇳" },
  { name: "Montenegro", code: "+382", flag: "🇲🇪" },
  { name: "Morocco", code: "+212", flag: "🇲🇦" },
  { name: "Mozambique", code: "+258", flag: "🇲🇿" },
  { name: "Myanmar", code: "+95", flag: "🇲🇲" },
  { name: "Namibia", code: "+264", flag: "🇳🇦" },
  { name: "Nauru", code: "+674", flag: "🇳🇷" },
  { name: "Nepal", code: "+977", flag: "🇳🇵" },
  { name: "Netherlands", code: "+31", flag: "🇳🇱" },
  { name: "New Zealand", code: "+64", flag: "🇳🇿" },
  { name: "Nicaragua", code: "+505", flag: "🇳🇮" },
  { name: "Niger", code: "+227", flag: "🇳🇪" },
  { name: "North Korea", code: "+850", flag: "🇰🇵" },
  { name: "Norway", code: "+47", flag: "🇳🇴" },
  { name: "Oman", code: "+968", flag: "🇴🇲" },
  { name: "Pakistan", code: "+92", flag: "🇵🇰" },
  { name: "Palau", code: "+680", flag: "🇵🇼" },
  { name: "Panama", code: "+507", flag: "🇵🇦" },
  { name: "Papua New Guinea", code: "+675", flag: "🇵🇬" },
  { name: "Paraguay", code: "+595", flag: "🇵🇾" },
  { name: "Peru", code: "+51", flag: "🇵🇪" },
  { name: "Philippines", code: "+63", flag: "🇵🇭" },
  { name: "Poland", code: "+48", flag: "🇵🇱" },
  { name: "Portugal", code: "+351", flag: "🇵🇹" },
  { name: "Qatar", code: "+974", flag: "🇶🇦" },
  { name: "Romania", code: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "Rwanda", code: "+250", flag: "🇷🇼" },
  { name: "Saint Kitts and Nevis", code: "+1-869", flag: "🇰🇳" },
  { name: "Saint Lucia", code: "+1-758", flag: "🇱🇨" },
  { name: "Samoa", code: "+685", flag: "🇼🇸" },
  { name: "San Marino", code: "+378", flag: "🇸🇲" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "Senegal", code: "+221", flag: "🇸🇳" },
  { name: "Serbia", code: "+381", flag: "🇷🇸" },
  { name: "Seychelles", code: "+248", flag: "🇸🇨" },
  { name: "Sierra Leone", code: "+232", flag: "🇸🇱" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "Slovakia", code: "+421", flag: "🇸🇰" },
  { name: "Slovenia", code: "+386", flag: "🇸🇮" },
  { name: "Solomon Islands", code: "+677", flag: "🇸🇧" },
  { name: "Somalia", code: "+252", flag: "🇸🇴" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "South Korea", code: "+82", flag: "🇰🇷" },
  { name: "South Sudan", code: "+211", flag: "🇸🇸" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
  { name: "Sudan", code: "+249", flag: "🇸🇩" },
  { name: "Suriname", code: "+597", flag: "🇸🇷" },
  { name: "Sweden", code: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "+41", flag: "🇨🇭" },
  { name: "Syria", code: "+963", flag: "🇸🇾" },
  { name: "Taiwan", code: "+886", flag: "🇹🇼" },
  { name: "Tajikistan", code: "+992", flag: "🇹🇯" },
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "Thailand", code: "+66", flag: "🇹🇭" },
  { name: "Togo", code: "+228", flag: "🇹🇬" },
  { name: "Tonga", code: "+676", flag: "🇹🇴" },
  { name: "Tunisia", code: "+216", flag: "🇹🇳" },
  { name: "Turkey", code: "+90", flag: "🇹🇷" },
  { name: "Turkmenistan", code: "+993", flag: "🇹🇲" },
  { name: "Tuvalu", code: "+688", flag: "🇹🇻" },
  { name: "Uganda", code: "+256", flag: "🇺🇬" },
  { name: "Ukraine", code: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "Uruguay", code: "+598", flag: "🇺🇾" },
  { name: "Uzbekistan", code: "+998", flag: "🇺🇿" },
  { name: "Vanuatu", code: "+678", flag: "🇻🇺" },
  { name: "Vatican City", code: "+39-06", flag: "🇻🇦" },
  { name: "Venezuela", code: "+58", flag: "🇻🇪" },
  { name: "Vietnam", code: "+84", flag: "🇻🇳" },
  { name: "Yemen", code: "+967", flag: "🇾🇪" },
  { name: "Zambia", code: "+260", flag: "🇿🇲" },
  { name: "Zimbabwe", code: "+263", flag: "🇿🇼" }
];

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]); // Default to Nigeria
  const [phoneCode, setPhoneCode] = useState(countryCodes[0].code); // Default to Nigeria's code
  const [phoneNumber, setPhoneNumber] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [otherUniversity, setOtherUniversity] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { universities, loading: universitiesLoading } = useUniversities();

  // Update phone code when country changes
  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    const country = countryCodes.find(c => c.name === countryName);
    if (country) {
      setSelectedCountry(country);
      setPhoneCode(country.code);
    }
  };

  const validateForm = () => {
    const newErrors = [];

    if (!username.trim()) {
      newErrors.push("Username is required.");
    }
    if (!email.trim()) {
      newErrors.push("Email is required.");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push("Email address is invalid.");
    }
    if (!password.trim()) {
      newErrors.push("Password is required.");
    }
    if (password !== confirmPassword) {
      newErrors.push("Passwords do not match.");
    }
    if (!phoneCode.trim()) {
      newErrors.push("Phone code is required.");
    }
    if (!phoneNumber.trim()) {
      newErrors.push("Phone number is required.");
    }
    if (!otherUniversity && !universityId) {
      newErrors.push("Please select your university.");
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (otherUniversity) {
      toast.info("Byte! is reaching your university soon! Please contact us via byte.chows@gmail.com");
      return;
    }

    setErrors([]);
    setIsLoading(true);

    try {
      const fullPhoneNumber = `${phoneCode}${phoneNumber}`;

      await axios.post("https://mongobyte.vercel.app/api/v1/auth/register", {
        username: username.trim(),
        email: email.trim(),
        password,
        phoneNumber: fullPhoneNumber,
        university: universityId, // Send the university ID instead of name
      });
      navigate("/signupsuccess");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const { response } = error;
        if (response) {
          const { data } = response;
          setErrors([data.message || "An error occurred. Please try again."]);
        } else {
          setErrors(["Network error. Please check your connection."]);
        }
      } else if (error instanceof Error) {
        setErrors([error.message || "An error occurred. Please try again."]);
      } else {
        setErrors(["An unexpected error occurred."]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      <div className="absolute inset-0">
        <img
          src="/Images/burger.jpg" 
          alt="Burger Background"
          className="object-cover w-full h-full z-0"
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {isLoading && <LoadingPage />}

      <div
        className={`relative z-10 flex items-center justify-center min-h-screen ${
          isLoading ? "hidden" : ""
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white bg-opacity-10 backdrop-blur-xs p-8 rounded-lg shadow-lg w-full max-w-md sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-accentwhite font-secondary">
            Sign Up for {BRAND_NAME}
          </h2>

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-pepperoni text-white rounded-lg">
              <ul>
                {errors.map((error, index) => (
                  <li key={index} className="mb-2">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-black p-2 border border-gray-300 rounded mt-1 font-sans"
              placeholder="Enter your username..."
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-black p-2 border border-gray-300 rounded mt-1 font-sans"
              placeholder="Enter your email address..."
              required
            />
          </div>

          {/* Country Selector and Phone Number Fields */}
          <div className="mb-4">
            <select
              id="country"
              value={selectedCountry.name}
              onChange={handleCountryChange}
              className="w-full p-2 border text-black border-gray-300 rounded mt-1 font-sans"
              required
            >
              {countryCodes.map((country) => (
                <option key={country.name} value={country.name}>
                  {country.flag} {country.name} ({country.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex mb-4">
            <div className="w-1/3 p-2 border text-black border-gray-300 rounded-l mt-1 font-sans bg-gray-100 flex items-center justify-center">
              {selectedCountry.code}
            </div>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-2/3 p-2 border text-black border-gray-300 rounded-r mt-1 font-sans"
              placeholder={selectedCountry.name === "Nigeria" ? "8090987555" : "Phone number"}
              required
            />
          </div>

          <div className="mb-4">
            <select
              id="university"
              value={universityId}
              onChange={(e) => {
                const value = e.target.value;
                setUniversityId(value);
                setOtherUniversity(value === "other");
              }}
              className="w-full p-2 border text-black border-gray-300 rounded mt-1 font-sans"
              required
              disabled={universitiesLoading}
            >
              <option value="">Select your university...</option>
              {universitiesLoading ? (
                <option value="" disabled>Loading universities...</option>
              ) : (
                universities.map((uni) => (
                  <option key={uni._id} value={uni._id}>
                    {uni.name}
                  </option>
                ))
              )}
              <option value="other">Other</option>
            </select>
          </div>

          {otherUniversity && (
            <div className="mb-4 p-4 bg-orange-100 rounded-lg">
              <p className="text-sm text-crust">
                We're working on reaching more universities! Please contact us at byte.chows@gmail.com
              </p>
            </div>
          )}

          <div className="mb-4">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 text-black border border-gray-300 rounded mt-1 font-sans"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 text-black border border-gray-300 rounded mt-1 font-sans"
              placeholder="Confirm your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition font-sans"
          >
            Sign Up
          </button>

          <div className="mt-4 text-center">
            <p className="text-accentwhite font-sans">Already have an account?</p>
            <a
              href="/login"
              className="text-blue-400 hover:text-blue-600 font-semibold mt-2 inline-block font-sans"
            >
              Log In Here!
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
