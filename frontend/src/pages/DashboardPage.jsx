import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { useFavorites } from '../context/FavoriteContext';
import { HomeIcon, HeartIcon, PlusIcon } from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { userData, user } = useAuth();
  const { properties } = useProperties();
  const { favorites } = useFavorites();

  // Calculate real stats from user data
  const userProperties = properties.filter(p => p.agent?.id === user?.id || p.ownerId === user?.uid);
  const totalListings = userProperties.length;
  const activeListings = userProperties.filter(p => p.status === 'available').length;
  const favoritesCount = favorites.length;

  const stats = [
    {
      name: 'Properties Listed',
      value: totalListings.toString(),
      icon: HomeIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Favorites',
      value: favoritesCount.toString(),
      icon: HeartIcon,
      color: 'bg-red-500'
    },
    {
      name: 'Active Listings',
      value: activeListings.toString(),
      icon: PlusIcon,
      color: 'bg-purple-500'
    }
  ];

  // Generate recent activities from user's properties
  const recentActivities = userProperties
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)
    .map(property => ({
      id: property.id,
      title: `Property "${property.title}" listed`,
      time: new Date(property.createdAt).toLocaleDateString(),
      status: property.status
    }));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userData?.displayName || 'User'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your real estate portfolio
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 bg-white rounded-lg shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link to="/properties" className="text-sm text-blue-600 hover:text-blue-800">
            Browse Properties
          </Link>
        </div>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center p-4 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full mr-4 ${
                  activity.status === 'approved' ? 'bg-emerald-500' :
                  activity.status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No recent activities</p>
              <p className="mt-1 text-sm text-gray-400">Start by adding your first property</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
