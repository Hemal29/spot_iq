import React, { createContext, useState, useCallback, useContext } from 'react';
import parkingService from '../services/parkingService';

const ParkingContext = createContext(null);

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};

const defaultFilters = {
  city: '',
  minPrice: '',
  maxPrice: '',
  amenities: [],
  sortBy: '',
};

export const ParkingProvider = ({ children }) => {
  const [parkings, setParkings] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [filters, setFiltersState] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);

  const fetchParkings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.city) params.city = filters.city;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.amenities && filters.amenities.length > 0) params.amenities = filters.amenities.join(',');
      if (filters.sortBy) params.sortBy = filters.sortBy;

      const response = await parkingService.getAllParking(params);
      setParkings(response.data);
    } catch (error) {
      console.error('Failed to fetch parkings:', error);
      setParkings([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchParkingById = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await parkingService.getParkingById(id);
      setSelectedParking(response.data);
    } catch (error) {
      console.error('Failed to fetch parking details:', error);
      setSelectedParking(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const setFilters = useCallback((newFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const value = {
    parkings,
    selectedParking,
    filters,
    loading,
    fetchParkings,
    fetchParkingById,
    setFilters,
    clearFilters,
    setSelectedParking,
  };

  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
};

export default ParkingContext;
