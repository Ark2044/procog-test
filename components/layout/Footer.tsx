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

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-indigo-50 text-gray-700 border-t border-indigo-100 relative">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Brand Section */}
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="mr-1.5 rounded-lg w-6 h-6 flex items-center justify-center bg-indigo-600 text-white text-base font-bold">
                P
              </div>
              <h3 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                PROCOG
              </h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Empowering risk management collaboration through innovative
              solutions and data-driven insights.
            </p>
            <div className="flex space-x-3 pt-1">
              <a
                href="https://facebook.com/procog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF size={16} />
              </a>
              <a
                href="https://twitter.com/procog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={16} />
              </a>
              <a
                href="https://linkedin.com/company/procog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={16} />
              </a>
              <a
                href="https://github.com/procog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub size={16} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-bold text-base mb-2 text-gray-800">Product</h4>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/guide"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-xs"
                >
                  User Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-xs"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-base mb-2 text-gray-800">Company</h4>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-xs"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-indigo-600 transition-colors text-xs"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-3 border-t border-b border-gray-200">
          <div className="flex items-center justify-center md:justify-start">
            <FaShieldAlt className="text-indigo-600 mr-2 text-base" />
            <div>
              <h5 className="font-semibold text-sm text-gray-800">
                Enterprise Grade Security
              </h5>
              <p className="text-xs text-gray-500">SOC 2 Type II Compliant</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <FaLock className="text-indigo-600 mr-2 text-base" />
            <div>
              <h5 className="font-semibold text-sm text-gray-800">
                Data Privacy
              </h5>
              <p className="text-xs text-gray-500">GDPR and CCPA Compliant</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-end">
            <FaHeadset className="text-indigo-600 mr-2 text-base" />
            <div>
              <h5 className="font-semibold text-sm text-gray-800">
                24/7 Support
              </h5>
              <p className="text-xs text-gray-500">
                Available for Enterprise Plans
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4 text-xs">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} Procog. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-gray-500">
              <Link
                href="/terms"
                className="hover:text-indigo-600 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="hover:text-indigo-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/cookies"
                className="hover:text-indigo-600 transition-colors"
              >
                Cookie Policy
              </Link>
              <Link
                href="/accessibility"
                className="hover:text-indigo-600 transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
