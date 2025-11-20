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
  { value: '0-500000', label: 'Up to $500K' },
  { value: '500000-1000000', label: '$500K – $1M' },
  { value: '1000000-2000000', label: '$1M – $2M' },
  { value: '2000000+', label: '$2M+' },
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900">Browse Properties</h1>
            <p className="text-xl text-gray-600">Discover your perfect home from our extensive collection</p>
          </div>

          {/* Filter Toggle Button - Mobile */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 lg:hidden"
          >
            <FiFilter className="w-5 h-5" />
            Filters
          </button>
        </motion.div>

        {/* Sliding Filter Panel */}
        <AnimatePresence>
          {(isFilterOpen || window.innerWidth >= 1024) && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl lg:relative lg:w-full lg:shadow-sm lg:rounded-lg lg:mb-8"
            >
              {/* Mobile Close Button */}
              <div className="flex items-center justify-between p-4 border-b lg:hidden">
                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 text-gray-500 transition-colors hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-screen lg:max-h-none">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="filter-type" className="block mb-2 text-sm font-medium text-gray-700">
                      Property Type
                    </label>
                    <select
                      id="filter-type"
                      name="filter-type"
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TYPES.map(opt => (
                        <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="filter-price-range" className="block mb-2 text-sm font-medium text-gray-700">
                      Quick Price Range
                    </label>
                    <select
                      id="filter-price-range"
                      name="filter-price-range"
                      value={filters.priceRange}
                      onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PRICE_RANGES.map(opt => (
                        <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {!filters.priceRange && (
                    <div>
                      <label className="block mb-3 text-sm font-medium text-gray-700">
                        Custom Price Range
                      </label>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="min-price" className="block mb-2 text-xs text-gray-600">
                            Minimum: {formatPrice(filters.minPrice)}
                          </label>
                          <input
                            id="min-price"
                            type="range"
                            min="0"
                            max="10000000"
                            step="100000"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                        <div>
                          <label htmlFor="max-price" className="block mb-2 text-xs text-gray-600">
                            Maximum: {formatPrice(filters.maxPrice)}
                          </label>
                          <input
                            id="max-price"
                            type="range"
                            min="0"
                            max="10000000"
                            step="100000"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="filter-bedrooms" className="block mb-2 text-sm font-medium text-gray-700">
                      Bedrooms
                    </label>
                    <select
                      id="filter-bedrooms"
                      name="filter-bedrooms"
                      value={filters.bedrooms}
                      onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {BEDROOMS.map(opt => (
                        <option key={opt.value || 'any'} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="filter-bathrooms" className="block mb-2 text-sm font-medium text-gray-700">
                      Bathrooms
                    </label>
                    <select
                      id="filter-bathrooms"
                      name="filter-bathrooms"
                      value={filters.bathrooms}
                      onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {BATHROOMS.map(opt => (
                        <option key={opt.value || 'any'} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="filter-location" className="block mb-2 text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      id="filter-location"
                      name="filter-location"
                      type="text"
                      placeholder="Enter location"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay for mobile */}
        {isFilterOpen && (
          <div
            onClick={() => setIsFilterOpen(false)}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          />
        )}

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="py-16 text-center text-gray-500">No properties found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
  );
};

export default PropertiesPage;
