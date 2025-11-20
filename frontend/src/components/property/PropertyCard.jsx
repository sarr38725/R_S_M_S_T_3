import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartIcon, MapPinIcon, HomeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Badge from '../common/Badge';
import { getImageUrl } from '../../utils/imageHelper';

const PropertyCard = ({ property, onFavorite, isFavorited = false }) => {
  const {
    id,
    title,
    price,
    location,
    images,
    type,
    bedrooms,
    bathrooms,
    area,
    featured,
    status,
    createdAt
  } = property;

  const hasImage = images && images.length > 0 && images[0];
  const imageUrl = hasImage ? getImageUrl(images[0]) : null;

  const formatPrice = (price) => {
    return '৳' + new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group w-full h-[480px] flex flex-col"
    >
      {/* Image Container - Fixed Height */}
      <div className="relative flex-shrink-0 h-56 overflow-hidden bg-gray-100">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <HomeIcon className="w-16 h-16 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">No Image Available</p>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:opacity-100" />
        
        {/* Badges */}
        <div className="absolute flex flex-wrap gap-2 top-4 left-4">
          {status === 'sold' && <Badge variant="danger" size="sm">SOLD</Badge>}
          {status === 'rented' && <Badge variant="warning" size="sm">RENTED</Badge>}
          {featured && status === 'available' && <Badge variant="featured" size="sm">Featured</Badge>}
          <Badge variant="info" size="sm">{type}</Badge>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onFavorite?.(id);
          }}
          className="absolute p-2 transition-all duration-200 rounded-full shadow-lg top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          {isFavorited ? (
            <HeartIconSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Content - Fixed Height with Flexbox */}
      <Link to={`/properties/${id}`} className="flex flex-col flex-1 block min-h-0 p-6">
        <div className="flex flex-col h-full">
          {/* Price and Title - Fixed Space */}
          <div className="flex-shrink-0 mb-3">
            <div className="mb-1 text-2xl font-bold text-blue-600">
              {formatPrice(price)}
            </div>
            <h3 className="overflow-hidden text-lg font-semibold text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600 h-14">
              {title}
            </h3>
          </div>

          {/* Location - Fixed Space */}
          <div className="flex items-center flex-shrink-0 mb-3 text-gray-600">
            <MapPinIcon className="flex-shrink-0 w-4 h-4 mr-1" />
            <span className="text-sm truncate">
              {location?.address}, {location?.city}, {location?.state}
            </span>
          </div>

          {/* Property Details - Fixed Space */}
          <div className="flex items-center justify-between flex-shrink-0 mb-3 text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <HomeIcon className="w-4 h-4 mr-1" />
                {bedrooms} bed
              </span>
              <span>{bathrooms} bath</span>
              <span>{area} sqft</span>
            </div>
          </div>

          {/* Date - Fixed at Bottom */}
          <div className="flex items-center flex-shrink-0 mt-auto text-xs text-gray-500">
            <CalendarIcon className="w-4 h-4 mr-1" />
            Listed {formatDate(createdAt)}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
