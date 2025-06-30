import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UniversitiesContext = createContext();

export const UniversitiesProvider = ({ children }) => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await axios.get('https://mongobyte.vercel.app/api/v1/universities');
      setUniversities(response.data.data.filter(uni => uni.isActive));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching universities:', error);
      setError('Failed to fetch universities');
      setLoading(false);
    }
  };

  return (
    <UniversitiesContext.Provider value={{ universities, loading, error }}>
      {children}
    </UniversitiesContext.Provider>
  );
};

export const useUniversities = () => useContext(UniversitiesContext);
