import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProperties } from '../../context/PropertyContext';
import { useUI } from '../../context/UIContext';
import {
  CheckCircleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getImageUrl } from '../../utils/imageHelper';

const AdminSales = () => {
  const { properties, updatePropertyStatus, loading, loadProperties } = useProperties();
  const { showToast } = useUI();
  const [filter, setFilter] = useState('available');
  const [soldRecords, setSoldRecords] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    thisMonth: { count: 0, total: 0 },
    thisYear: { count: 0, total: 0 },
    allTime: { count: 0, total: 0 }
  });

  // Load sold records from storage on mount
  useEffect(() => {
    loadProperties({});
    loadSoldRecords();
  }, [loadProperties]);

  // Load sold records from localStorage
  const loadSoldRecords = () => {
    try {
      const stored = localStorage.getItem('soldPropertyRecords');
      if (stored) {
        const records = JSON.parse(stored);
        setSoldRecords(records);
      }
    } catch (error) {
      console.error('Error loading sold records:', error);
    }
  };

  // Save sold records to localStorage
  const saveSoldRecords = (records) => {
    try {
      localStorage.setItem('soldPropertyRecords', JSON.stringify(records));
      setSoldRecords(records);
    } catch (error) {
      console.error('Error saving sold records:', error);
      showToast('Failed to save sales record', 'error');
    }
  };

  // Create a sale record when property is marked as sold
  const createSaleRecord = (property, saleStatus) => {
    const saleRecord = {
      id: `sale_${property.id}_${Date.now()}`,
      propertyId: property.id,
      title: property.title,
      listingType: property.listingType,
      status: saleStatus,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      location: property.location,
      images: property.images,
      agent: property.agent,
      saleDate: new Date().toISOString(),
      createdAt: property.createdAt,
      originalPropertyData: { ...property }
    };

    const existingRecords = [...soldRecords];
    
    // Check if this property already has a sale record
    const existingIndex = existingRecords.findIndex(r => r.propertyId === property.id);
    
    if (existingIndex >= 0) {
      // Update existing record
      existingRecords[existingIndex] = saleRecord;
    } else {
      // Add new record
      existingRecords.push(saleRecord);
    }

    saveSoldRecords(existingRecords);
    return saleRecord;
  };

  // Calculate statistics from sold records
  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthSales = soldRecords.filter(r => {
      const saleDate = new Date(r.saleDate);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    const yearSales = soldRecords.filter(r => {
      const saleDate = new Date(r.saleDate);
      return saleDate.getFullYear() === currentYear;
    });

    setStats({
      thisMonth: {
        count: monthSales.length,
        total: monthSales.reduce((sum, r) => sum + (Number(r.price) || 0), 0)
      },
      thisYear: {
        count: yearSales.length,
        total: yearSales.reduce((sum, r) => sum + (Number(r.price) || 0), 0)
      },
      allTime: {
        count: soldRecords.length,
        total: soldRecords.reduce((sum, r) => sum + (Number(r.price) || 0), 0)
      }
    });

    // Generate chart data for last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthYear = date.getMonth();
      const year = date.getFullYear();

      const monthlySales = soldRecords.filter(r => {
        const saleDate = new Date(r.saleDate);
        return saleDate.getMonth() === monthYear && saleDate.getFullYear() === year;
      });

      const soldCount = monthlySales.filter(r => r.status === 'sold').length;
      const rentedCount = monthlySales.filter(r => r.status === 'rented').length;
      const revenue = monthlySales.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

      months.push({
        month: monthName,
        sold: soldCount,
        rented: rentedCount,
        revenue: revenue / 1000,
        total: soldCount + rentedCount
      });
    }

    setChartData(months);
  }, [soldRecords]);

  const handleMarkAsSold = async (propertyId, listingType) => {
    try {
      const property = properties.find(p => p.id === propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      const newStatus = listingType === 'rent' ? 'rented' : 'sold';
      
      // Create permanent sale record BEFORE updating property status
      createSaleRecord(property, newStatus);
      
      // Update property status in the main system
      await updatePropertyStatus(propertyId, newStatus);
      
      showToast(`Property marked as ${newStatus} and sale record saved!`, 'success');
    } catch (error) {
      showToast(error.message || 'Failed to update property status', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredProperties = properties.filter(p => {
    if (filter === 'available') {
      return p.status === 'available';
    } else if (filter === 'sold') {
      return p.status === 'sold' || p.status === 'rented';
    }
    return true;
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="mb-2 font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Revenue' ? `$${entry.value}K` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
        <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
        <p className="mt-2 text-gray-600">
          Track property sales and manage sold properties
        </p>
      </motion.div>

      {/* Sales Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-700">This Month</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">{stats.thisMonth.count}</p>
            <p className="text-sm text-gray-600">Properties Sold</p>
            <p className="text-lg font-semibold text-blue-600">
              {formatCurrency(stats.thisMonth.total)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 border shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border-emerald-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <ChartBarIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-700">This Year</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">{stats.thisYear.count}</p>
            <p className="text-sm text-gray-600">Properties Sold</p>
            <p className="text-lg font-semibold text-emerald-600">
              {formatCurrency(stats.thisYear.total)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 border border-purple-200 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-700">All Time</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">{stats.allTime.count}</p>
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-lg font-semibold text-purple-600">
              {formatCurrency(stats.allTime.total)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Sales Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-white shadow-sm rounded-2xl"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Revenue Trend (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => `$${value}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)"
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-white shadow-sm rounded-2xl"
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Sales Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="sold" fill="#10b981" radius={[8, 8, 0, 0]} name="Sold" />
              <Bar dataKey="rented" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Rented" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Permanent Sales History - Now independent of active properties */}
      {soldRecords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 bg-white shadow-sm rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Permanent Sales History</h2>
              <p className="mt-1 text-sm text-gray-500">Records remain even if properties are deleted</p>
            </div>
            <Badge variant="success">{soldRecords.length} Total Sales</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Property
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Sale Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Sale Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {soldRecords
                  .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
                  .map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            {record.images && record.images.length > 0 ? (
                              <img
                                src={getImageUrl(record.images[0])}
                                alt={record.title}
                                className="object-cover w-10 h-10 rounded-lg"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                                <HomeIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.bedrooms} bed • {record.bathrooms} bath
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={record.listingType === 'sale' ? 'success' : 'info'} size="sm">
                          {record.listingType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {record.location?.city}, {record.location?.state}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(record.saleDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.agent?.name || 'N/A'}</div>
                        {record.agent?.email && (
                          <div className="text-xs text-gray-500">{record.agent.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="success" size="sm">
                          {record.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-right text-gray-900 whitespace-nowrap">
                        {formatCurrency(record.price)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-6 bg-white shadow-sm rounded-2xl"
      >
        <div className="flex mb-6 space-x-4">
          <button
            onClick={() => setFilter('available')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'available'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Available Properties ({properties.filter(p => p.status === 'available').length})
          </button>
          <button
            onClick={() => setFilter('sold')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'sold'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Currently Sold (Not Deleted) ({properties.filter(p => p.status === 'sold' || p.status === 'rented').length})
          </button>
        </div>

        {/* Properties List */}
        <div className="space-y-4">
          {filteredProperties.length === 0 ? (
            <div className="py-12 text-center">
              <HomeIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No properties found</p>
            </div>
          ) : (
            filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 transition-shadow border border-gray-200 rounded-lg hover:shadow-md"
              >
                <div className="flex items-center flex-1 space-x-4">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={getImageUrl(property.images[0])}
                      alt={property.title}
                      className="object-cover w-20 h-20 rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-lg">
                      <HomeIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{property.title}</h3>
                    <p className="text-sm text-gray-600">
                      {property.location?.city}, {property.location?.state}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant={property.listingType === 'sale' ? 'success' : 'info'} size="sm">
                        {property.listingType}
                      </Badge>
                      <Badge
                        variant={
                          property.status === 'sold' || property.status === 'rented'
                            ? 'success'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {property.status}
                      </Badge>
                    </div>
                    {(property.status === 'sold' || property.status === 'rented') && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Agent:</span> {property.agent?.name || 'N/A'}
                        </p>
                        {property.agent?.email && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Contact:</span> {property.agent.email}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(property.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {property.bedrooms} bed • {property.bathrooms} bath
                    </p>
                    {property.area && (
                      <p className="mt-1 text-xs text-gray-400">
                        {property.area} sqft
                      </p>
                    )}
                  </div>
                </div>

                {property.status === 'available' && (
                  <div className="ml-4">
                    <Button
                      onClick={() => handleMarkAsSold(property.id, property.listingType)}
                      variant="primary"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <CheckCircleSolidIcon className="w-4 h-4" />
                      <span>Mark as {property.listingType === 'rent' ? 'Rented' : 'Sold'}</span>
                    </Button>
                  </div>
                )}

                {(property.status === 'sold' || property.status === 'rented') && (
                  <div className="flex items-center ml-4 space-x-2 text-emerald-600">
                    <CheckCircleSolidIcon className="w-6 h-6" />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSales;