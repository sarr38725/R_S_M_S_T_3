import React from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  UserGroupIcon, 
  TrophyIcon, 
  HeartIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const AboutPage = () => {
  const stats = [
    { label: 'Properties Listed', value: '10,000+', icon: HomeIcon },
    { label: 'Happy Clients', value: '5,000+', icon: UserGroupIcon },
    { label: 'Awards Won', value: '25+', icon: TrophyIcon },
    { label: 'Years Experience', value: '15+', icon: HeartIcon },
  ];

  const features = [
    'Expert real estate guidance',
    'Comprehensive market analysis',
    'Professional photography',
    'Virtual property tours',
    'Negotiation expertise',
    '24/7 customer support'
  ];

  // UPDATED TEAM MEMBER IMAGES
  const teamMembers = [
    {
      name: 'Rohit Sarkar',
      role: 'Senior Real Estate Agent',
      image: './images/rohit.jpg',
      experience: '10+ years'
    },
    {
      name: 'Tanjir Ahammad',
      role: 'Property Investment Specialist',
      image: './images/tanjir.jpg',
      experience: '8+ years'
    },
 {
  name: 'Rishad Islam',
  role: 'Luxury Home Consultant',
  image: './images/rishad.png',
  experience: '12+ years'
}
  ];

  return (
    <div className="pt-16">
      
      {/* HERO SECTION */}
      <section className="py-20 text-white bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              About RealEstate
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-blue-100 md:text-2xl">
              Your trusted partner in finding the perfect property. We've been 
              connecting clients with their dream homes for over 15 years.
            </p>
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mb-2 text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            
            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-gray-900">
                Our Mission
              </h2>
              <p className="mb-6 text-lg text-gray-600">
                We believe finding the perfect home should be enjoyable—not stressful. 
                Our mission is to simplify the property search with professional guidance 
                and world-class customer service.
              </p>

              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-3 text-emerald-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT IMAGE */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://www.crmjetty.com/wp-content/uploads/2021/07/Management-Feature.png"
                alt="Real estate team"
                className="shadow-2xl rounded-2xl"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Meet Our Team
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Our experienced professionals work hard to help you achieve 
              your real estate dreams.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 text-center bg-white shadow-lg rounded-2xl"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="object-cover w-24 h-24 mx-auto mb-4 rounded-full"
                />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {member.name}
                </h3>
                <p className="mb-2 text-blue-600">{member.role}</p>
                <p className="text-sm text-gray-600">{member.experience}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};

export default AboutPage;
