import api from './api';

const favoriteService = {
  getUserFavorites: async () => {
    try {
      const response = await api.get('/favorites');
      return { success: true, data: response.data.favorites };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch favorites'
      };
    }
  },

  addFavorite: async (propertyId) => {
    try {
      const response = await api.post('/favorites', { property_id: propertyId });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add favorite'
      };
    }
  },

  removeFavorite: async (propertyId) => {
    try {
      const response = await api.delete(`/favorites/${propertyId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove favorite'
      };
    }
  },

  checkFavorite: async (propertyId) => {
    try {
      const response = await api.get(`/favorites/check/${propertyId}`);
      return { success: true, isFavorited: response.data.isFavorited };
    } catch (error) {
      return {
        success: false,
        isFavorited: false,
        error: error.response?.data?.message || 'Failed to check favorite'
      };
    }
  }
};

export default favoriteService;
