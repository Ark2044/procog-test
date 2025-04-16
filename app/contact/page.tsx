"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<null | "success" | "error">(
    null
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setFormStatus("success");
      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
      });
      // Reset status after 5 seconds
      setTimeout(() => setFormStatus(null), 5000);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white text-gray-800 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
            Contact Us
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
            Have questions about our risk management platform? We&apos;re here to
            help. Reach out to our team for support, demos, or partnership
            inquiries.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Contact Information */}
            <div className="md:col-span-1 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
              >
                <div className="flex items-start">
                  <div className="mr-4 bg-indigo-100 p-3 rounded-lg">
                    <FaEnvelope className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">
                      Email
                    </h3>
                    <p className="text-gray-600 mb-2">For general inquiries:</p>
                    <a
                      href="mailto:info@procog.com"
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      info@procog.com
                    </a>
                    <p className="text-gray-600 mt-2 mb-2">For support:</p>
                    <a
                      href="mailto:support@procog.com"
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      support@procog.com
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
              >
                <div className="flex items-start">
                  <div className="mr-4 bg-indigo-100 p-3 rounded-lg">
                    <FaPhone className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">
                      Phone
                    </h3>
                    <p className="text-gray-600 mb-2">Main Office:</p>
                    <a
                      href="tel:+1-800-555-0123"
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      +1 (800) 555-0123
                    </a>
                    <p className="text-gray-600 mt-2 mb-2">Support Line:</p>
                    <a
                      href="tel:+1-800-555-0199"
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      +1 (800) 555-0199
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
              >
                <div className="flex items-start">
                  <div className="mr-4 bg-indigo-100 p-3 rounded-lg">
                    <FaMapMarkerAlt className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">
                      Location
                    </h3>
                    <p className="text-gray-600">
                      2023 Innovation Drive
                      <br />
                      Suite 500
                      <br />
                      San Francisco, CA 94104
                      <br />
                      United States
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 bg-white rounded-xl shadow-sm p-8 border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Get in Touch
              </h2>

              {formStatus === "success" && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  Thank you for your message! We&apos;ll get back to you shortly.
                </div>
              )}

              {formStatus === "error" && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  There was an error sending your message. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="demo">Request a Demo</option>
                      <option value="partnership">
                        Partnership Opportunity
                      </option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="privacy"
                    required
                    className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-700">
                    I agree to the{" "}
                    <a
                      href="/privacy"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                What is your response time?
              </h3>
              <p className="text-gray-600">
                We aim to respond to all inquiries within 24 business hours. For
                urgent matters, please reach out to our support line directly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                How can I request a demo?
              </h3>
              <p className="text-gray-600">
                You can request a demo by selecting &quot;Request a Demo&quot; in the
                contact form above, or by emailing demo@procog.com with your
                company information and requirements.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                Do you offer enterprise plans?
              </h3>
              <p className="text-gray-600">
                Yes, we offer customized enterprise plans with dedicated
                support, advanced security features, and integration services.
                Contact our sales team for details.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
