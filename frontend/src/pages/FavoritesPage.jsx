import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoriteContext';
import { useUI } from '../context/UIContext';
import { propertyService } from '../services/propertyService';
import PropertyCard from '../components/property/PropertyCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FavoritesPage = () => {
  const { user } = useAuth();
  const { favorites, loading: favLoading, toggleFavorite, isFavorited } = useFavorites();
  const { showToast } = useUI();
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavoriteProperties = async () => {
      if (!user || favorites.length === 0) {
        setFavoriteProperties([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const propertyPromises = favorites.map(async (fav) => {
          try {
            const response = await propertyService.getPropertyById(fav.property_id);
            const p = response.property;
            return {
              id: p.id,
              title: p.title,
              description: p.description,
              type: p.property_type,
              listingType: p.listing_type,
              price: p.price,
              location: {
                address: p.address,
                city: p.city,
                state: p.state,
                zipCode: p.zip_code,
                country: p.country,
              },
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              area: p.area_sqft,
              yearBuilt: p.year_built,
              status: p.status,
              featured: p.featured,
              images: p.images || [],
              agent: {
                name: p.agent_name,
                email: p.agent_email,
                phone: p.agent_phone,
              },
              createdAt: new Date(p.created_at),
              updatedAt: new Date(p.updated_at),
            };
          } catch (error) {
            console.error(`Error loading property ${fav.property_id}:`, error);
            return null;
          }
        });

        const properties = await Promise.all(propertyPromises);
        setFavoriteProperties(properties.filter(p => p !== null));
      } catch (error) {
        console.error('Error loading favorite properties:', error);
        setFavoriteProperties([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteProperties();
  }, [favorites, user]);

  const handleFavoriteToggle = async (propertyId) => {
    const result = await toggleFavorite(propertyId);
    if (result.success) {
      showToast('Removed from favorites', 'info');
    } else {
      showToast(result.error || 'Failed to remove favorite', 'error');
    }
  };

  if (loading || favLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Favorite Properties</h1>
        <p className="text-gray-600 mt-2">
          Properties you've saved for later
        </p>
      </motion.div>

      {favoriteProperties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="bg-white rounded-lg shadow-sm p-8">
            <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600">
              Start browsing properties and save your favorites here
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PropertyCard
                property={property}
                onFavorite={handleFavoriteToggle}
                isFavorited={isFavorited(property.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;