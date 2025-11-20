import React, { useState, useEffect, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useProperties } from '../context/PropertyContext';
import PropertyCard from '../components/property/PropertyCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiFilter, FiX } from 'react-icons/fi';

function parsePriceRange(range) {
  if (!range) return { minPrice: null, maxPrice: null };
  const clean = String(range).trim();
  if (!clean) return { minPrice: null, maxPrice: null };

  if (clean.endsWith('+')) {
    const min = Number(clean.replace('+', ''));
    return { minPrice: Number.isFinite(min) ? min : null, maxPrice: null };
  }
  const [minRaw, maxRaw] = clean.split('-');
  const min = Number(minRaw);
  const max = Number(maxRaw);
  return {
    minPrice: Number.isFinite(min) ? min : null,
    maxPrice: Number.isFinite(max) ? max : null
  };
}

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'villa', label: 'Villa' },
];

const PRICE_RANGES = [
  { value: '', label: 'All Prices' },
  { value: '0-500000', label: 'Up to ৳500K' },
  { value: '500000-1000000', label: '৳500K – ৳1M' },
  { value: '1000000-2000000', label: '৳1M – ৳2M' },
  { value: '2000000+', label: '৳2M+' },
];

const BEDROOMS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

const BATHROOMS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

const PropertiesPage = () => {
  const { properties, loading, loadProperties } = useProperties();

  const [filters, setFilters] = useState({
    type: '',
    priceRange: '',
    location: '',
    minPrice: 0,
    maxPrice: 10000000,
    bedrooms: '',
    bathrooms: '',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // derive query-friendly filters
  const parsed = useMemo(() => {
    const { minPrice: rangeMin, maxPrice: rangeMax } = parsePriceRange(filters.priceRange);
    return {
      type: filters.type || null,
      location: filters.location?.trim() || null,
      minPrice: filters.priceRange ? rangeMin : filters.minPrice,
      maxPrice: filters.priceRange ? rangeMax : filters.maxPrice,
      bedrooms: filters.bedrooms || null,
      bathrooms: filters.bathrooms || null,
    };
  }, [filters]);

  // debounce so we don't query on every keystroke
  const [debounced, setDebounced] = useState(parsed);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(parsed), 300);
    return () => clearTimeout(t);
  }, [parsed]);

  // load properties when debounced filters change
  useEffect(() => {
    loadProperties(debounced); // memoized in context
  }, [debounced, loadProperties]);

  const resetFilters = () => {
    setFilters({
      type: '',
      priceRange: '',
      location: '',
      minPrice: 0,
      maxPrice: 10000000,
      bedrooms: '',
      bathrooms: '',
    });
  };

  const formatPrice = (value) => {
    return '৳' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header - Mobile Only */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 lg:hidden"
        >
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <FiFilter className="w-4 h-4" />
            Filters
          </button>
        </motion.div>

        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <AnimatePresence>
            {(isFilterOpen || window.innerWidth >= 1024) && (
              <>
                {/* Overlay for mobile */}
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsFilterOpen(false)}
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                  />
                )}

                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:relative lg:sticky lg:top-20 lg:h-fit lg:w-64 lg:shadow-none lg:border lg:border-gray-200 lg:rounded-lg"
                >
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-4 border-b lg:hidden">
                    <h2 className="text-lg font-semibold text-gray-900">Filter by</h2>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="p-1 text-gray-500 transition-colors hover:text-gray-700"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Desktop Header */}
                  <div className="hidden p-4 border-b lg:block">
                    <h2 className="text-sm font-semibold text-gray-900">Filter by</h2>
                  </div>

                  <div className="p-4 overflow-y-auto max-h-screen lg:max-h-[calc(100vh-12rem)]">
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 text-xs font-semibold text-gray-700">
                          Property Type
                        </label>
                        <select
                          value={filters.type}
                          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {TYPES.map(opt => (
                            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2 text-xs font-semibold text-gray-700">
                          Price Range
                        </label>
                        <select
                          value={filters.priceRange}
                          onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {PRICE_RANGES.map(opt => (
                            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {!filters.priceRange && (
                        <div className="pt-1">
                          <label className="block mb-2 text-xs font-semibold text-gray-700">
                            Custom Range
                          </label>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600">{formatPrice(filters.minPrice)}</span>
                            <span className="text-xs text-gray-600">{formatPrice(filters.maxPrice)}</span>
                          </div>
                          <div className="space-y-2">
                            <input
                              type="range"
                              min="0"
                              max="10000000"
                              step="100000"
                              value={filters.minPrice}
                              onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <input
                              type="range"
                              min="0"
                              max="10000000"
                              step="100000"
                              value={filters.maxPrice}
                              onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block mb-2 text-xs font-semibold text-gray-700">
                          Bedrooms
                        </label>
                        <select
                          value={filters.bedrooms}
                          onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {BEDROOMS.map(opt => (
                            <option key={opt.value || 'any'} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2 text-xs font-semibold text-gray-700">
                          Bathrooms
                        </label>
                        <select
                          value={filters.bathrooms}
                          onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {BATHROOMS.map(opt => (
                            <option key={opt.value || 'any'} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2 text-xs font-semibold text-gray-700">
                          Location
                        </label>
                        <input
                          type="text"
                          placeholder="Enter location"
                          value={filters.location}
                          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <button
                        onClick={resetFilters}
                        className="w-full px-3 py-2 text-sm font-medium text-blue-600 transition-colors border border-blue-600 rounded-md hover:bg-blue-50"
                      >
                        Reset filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Right Content - Properties */}
          <div className="flex-1">
            {/* Desktop Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden mb-6 lg:block"
            >
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Browse Properties</h1>
              <p className="text-base text-gray-600">Discover your perfect home from our extensive collection</p>
            </motion.div>

            {/* Properties Grid */}
            {properties.length === 0 ? (
              <div className="py-16 text-center text-gray-500">No properties found.</div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.5) }}
                  >
                    <PropertyCard property={property} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;
