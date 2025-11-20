import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import favoriteService from '../services/favoriteService';

const FavoriteContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};

export const FavoriteProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await favoriteService.getUserFavorites();
      if (result.success) {
        setFavorites(result.data);
        const ids = new Set(result.data.map(f => f.property_id));
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (propertyId) => {
    if (!user) {
      return { success: false, error: 'Please login to add favorites' };
    }

    const isFavorited = favoriteIds.has(propertyId);

    try {
      if (isFavorited) {
        const result = await favoriteService.removeFavorite(propertyId);
        if (result.success) {
          setFavorites(prev => prev.filter(f => f.property_id !== propertyId));
          setFavoriteIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(propertyId);
            return newSet;
          });
        }
        return result;
      } else {
        const result = await favoriteService.addFavorite(propertyId);
        if (result.success) {
          await loadFavorites();
        }
        return result;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, error: error.message };
    }
  };

  const isFavorited = (propertyId) => {
    return favoriteIds.has(propertyId);
  };

  const value = {
    favorites,
    favoriteIds,
    loading,
    loadFavorites,
    toggleFavorite,
    isFavorited
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};
