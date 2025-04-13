"use client";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaGithub,
  FaShieldAlt,
  FaLock,
  FaHeadset,
} from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send this to your backend or email service
    alert(`Thank you! ${email} has been subscribed to our newsletter.`);
    setEmail("");
  };

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-indigo-50 text-gray-700 pt-16 pb-8 border-t border-indigo-100 relative z-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="mr-2 rounded-lg w-8 h-8 flex items-center justify-center bg-indigo-600 text-white text-xl font-bold">
                P
              </div>
              <h3 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                PROCOG
              </h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Empowering risk management collaboration through innovative
              solutions and data-driven insights.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="#"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={18} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub size={18} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-800">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/guide"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  User Guide
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  API Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-800">Company</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  Press Kit
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-sm"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-800">
              Stay Updated
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Subscribe to our newsletter to get the latest updates on risk
              management.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-t border-b border-gray-200">
          <div className="flex items-center justify-center md:justify-start">
            <FaShieldAlt className="text-indigo-600 mr-3 text-xl" />
            <div>
              <h5 className="font-semibold text-gray-800">
                Enterprise Grade Security
              </h5>
              <p className="text-xs text-gray-500">SOC 2 Type II Compliant</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <FaLock className="text-indigo-600 mr-3 text-xl" />
            <div>
              <h5 className="font-semibold text-gray-800">Data Privacy</h5>
              <p className="text-xs text-gray-500">GDPR and CCPA Compliant</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-end">
            <FaHeadset className="text-indigo-600 mr-3 text-xl" />
            <div>
              <h5 className="font-semibold text-gray-800">24/7 Support</h5>
              <p className="text-xs text-gray-500">
                Available for Enterprise Plans
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} Procog. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-gray-500">
              <a href="#" className="hover:text-indigo-600 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-indigo-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-indigo-600 transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="hover:text-indigo-600 transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
