import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ContactPage = () => {

  // STATIC AGENTS
  const agents = [
    {
      name: 'Rohit Sarkar',
      email: 'rohit.sarkar55555555@gmail.com',
      phone: '01615755420',
    },
    {
      name: 'Agent Rahim',
      email: 'rohi80059@gmail.com',
      phone: '01733794685',
    },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    toEmail: agents[0].email,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message submitted! (Static version – no backend email API)");
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      toEmail: agents[0].email,
    });
  };

  // CONTACT INFO (UPDATED WITH YOUR LOCATION)
  const contactInfo = [
    {
      icon: MapPinIcon,
      title: 'Visit Us',
      details: ['Saipur, Nilphamari', 'Rangpur Division, Bangladesh']
    },
    {
      icon: PhoneIcon,
      title: 'Call Us',
      details: ['01615755420', '01733794685']
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Us',
      details: ['rohit.sarkar55555555@gmail.com', 'rohi80059@gmail.com']
    },
    {
      icon: ClockIcon,
      title: 'Office Hours',
      details: ['Mon - Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM']
    }
  ];

  return (
    <div className="pt-16">

      {/* HERO */}
      <section className="py-20 text-white bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="px-4 mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="mb-6 text-5xl font-bold">Contact Us</h1>
            <p className="max-w-3xl mx-auto text-xl text-blue-100">
              Reach out to our team — we’re always ready to help you find your dream home.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONTACT INFO */}
      <section className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                  <info.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="mb-3 text-lg font-semibold">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600">{detail}</p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATIC AGENTS */}
      <section className="py-10 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl">
          <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="mb-6 text-3xl font-bold">
            Our Agents — Quick Contact
          </motion.h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {agents.map((a, i) => (
              <motion.div
                key={a.email}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 bg-white shadow-md rounded-2xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{a.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="flex items-center gap-2 text-gray-700">
                        <EnvelopeIcon className="w-5 h-5" /> {a.email}
                      </p>
                      <p className="flex items-center gap-2 text-gray-700">
                        <PhoneIcon className="w-5 h-5" /> {a.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <a href={`tel:${a.phone}`} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                      Call
                    </a>
                    <a href={`mailto:${a.email}`} className="px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200">
                      Email
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GOOGLE MAP SECTION */}
      <section className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl font-bold">Find Our Office</h2>
            <p className="text-xl text-gray-600">Saipur, Nilphamari — Bangladesh</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="overflow-hidden bg-gray-200 shadow-xl rounded-2xl h-96"
          >
            <iframe
              title="Office Location"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14490.831934417156!2d88.8585!3d25.9384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e35e97b9010b0f%3A0xa37fbaf6a6a8b4df!2sSaidpur%2C%20Nilphamari!5e0!3m2!1sen!2sbd!4v1707585640000"
            ></iframe>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default ContactPage;
