// src/pages/PropertyDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPinIcon, CalendarIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { propertyService } from '../services/propertyService';
import { getImageUrls } from '../utils/imageHelper';
import { useFavorites } from '../context/FavoriteContext';
import { useUI } from '../context/UIContext';

import ScheduleModal from '../components/property/ScheduleModal';
import ContactModal from '../components/property/ContactModal';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

function normalizeDate(v) {
  if (!v) return null;
  if (typeof v?.toDate === 'function') return v.toDate();
  return new Date(v);
}

function asImageArray(images) {
  return getImageUrls(images);
}

function formatPrice(n) {
  if (typeof n !== 'number') return '—';
  return '৳' + new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(n);
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { toggleFavorite, isFavorited } = useFavorites();
  const { showToast } = useUI();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleFavoriteToggle = async () => {
    const result = await toggleFavorite(parseInt(id));
    if (result.success) {
      if (isFavorited(parseInt(id))) {
        showToast('Removed from favorites', 'info');
      } else {
        showToast('Added to favorites', 'success');
      }
    } else {
      showToast(result.error || 'Failed to update favorite', 'error');
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const response = await propertyService.getPropertyById(id);
        const p = response.property;

        const data = {
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

        if (alive) {
          setProperty(data);
          setCurrentImageIndex(0);
        }
      } catch (e) {
        if (alive) {
          if (e.response?.status === 404) {
            setErr('not-found');
          } else {
            setErr(e.message || 'Failed to load property');
          }
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (property && (property.status === 'sold' || property.status === 'rented')) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Property No Longer Available</h2>
          <p className="mb-4 text-gray-600">
            This property has been {property.status === 'sold' ? 'sold' : 'rented'}.
          </p>
          <Button onClick={() => window.location.href = '/properties'}>
            View Available Properties
          </Button>
        </div>
      </div>
    );
  }

  if (err === 'not-found' || !property) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Property Not Found</h2>
          <p className="text-gray-600">The property you’re looking for doesn’t exist.</p>
        </div>
      </div>
    );
  }

  const images = asImageArray(property.images);
  const createdAt = normalizeDate(property.createdAt);
  const agent = property.agent || { name: 'Property Agent', phone: '', email: '' };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Image Gallery */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          {images.length > 0 ? (
            <div className="relative">
              <div className="flex gap-4 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {images.map((image, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-full md:w-[calc(33.333%-11px)] snap-start"
                  >
                    <div
                      className="relative h-96 md:h-[500px] overflow-hidden bg-gray-100 rounded-2xl group cursor-pointer"
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setShowImageModal(true);
                      }}
                    >
                      <img
                        src={image}
                        alt={`${property.title || 'Property'} - Image ${idx + 1}`}
                        className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute px-3 py-1 text-sm font-medium text-white rounded-full top-4 right-4 bg-black/50 backdrop-blur-sm">
                        {idx + 1} / {images.length}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gray-100">
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                  <MapPinIcon className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-500">No Images Available</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6 lg:col-span-2"
          >
            {/* Header */}
            <div className="p-6 bg-white shadow-sm rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {property.flags?.featured && <Badge variant="featured" size="sm">Featured</Badge>}
                    {property.type && <Badge variant="info" size="sm">{property.type}</Badge>}
                  </div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    {property.title || 'Untitled Property'}
                  </h1>
                  <div className="flex items-center mb-4 text-gray-600">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <span>
                      {property.location?.address}
                      {property.location?.city ? `, ${property.location.city}` : ''}
                      {property.location?.state ? `, ${property.location.state}` : ''}
                      {property.location?.zipCode ? ` ${property.location.zipCode}` : ''}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleFavoriteToggle}
                  className="p-2 transition-colors rounded-full hover:bg-gray-100"
                  aria-label="Favorite"
                >
                  {isFavorited(parseInt(id)) ? (
                    <HeartIconSolid className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-gray-400 hover:text-red-500" />
                  )}
                </button>
              </div>

              <div className="mb-6 text-3xl font-bold text-blue-600">
                {formatPrice(property.price)}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-gray-50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{property.bedrooms ?? '—'}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{property.bathrooms ?? '—'}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{property.area ?? '—'}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="p-6 bg-white shadow-sm rounded-2xl">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Description</h2>
                <p className="leading-relaxed text-gray-600">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {Array.isArray(property.amenities) && property.amenities.length > 0 && (
              <div className="p-6 bg-white shadow-sm rounded-2xl">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Amenities</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 mr-3 bg-blue-500 rounded-full"></div>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Contact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="sticky p-6 bg-white shadow-sm rounded-2xl top-24">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Contact Agent</h3>

              <div className="mb-6 space-y-4">
                <div>
                  <div className="font-medium text-gray-900">{agent.name}</div>
                  <div className="text-sm text-gray-600">Real Estate Agent</div>
                </div>
                <div className="space-y-2">
                  {agent.phone && <div className="text-sm text-gray-600">📞 {agent.phone}</div>}
                  {agent.email && <div className="text-sm text-gray-600">📧 {agent.email}</div>}
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={() => setShowScheduleModal(true)}>
                  Schedule Viewing
                </Button>
                <Button variant="secondary" className="w-full" size="lg" onClick={() => setShowContactModal(true)}>
                  Contact Agent
                </Button>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Listed on {createdAt ? createdAt.toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  }) : '—'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        property={property}
      />
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        property={property}
      />

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute z-10 text-white transition-colors top-4 right-4 hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative flex items-center justify-center w-full h-full p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
              }}
              className="absolute z-10 p-3 transition-all rounded-full left-4 bg-white/10 backdrop-blur-sm hover:bg-white/20"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center justify-center max-h-full max-w-7xl" onClick={(e) => e.stopPropagation()}>
              <img
                src={images[currentImageIndex]}
                alt={`${property.title || 'Property'} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
              }}
              className="absolute z-10 p-3 transition-all rounded-full right-4 bg-white/10 backdrop-blur-sm hover:bg-white/20"
              aria-label="Next image"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute px-4 py-2 text-sm font-medium text-white transform -translate-x-1/2 rounded-full bottom-8 left-1/2 bg-black/50 backdrop-blur-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
