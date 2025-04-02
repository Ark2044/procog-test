import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-indigo-50 to-purple-50 text-gray-700 py-16 border-t border-indigo-100">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-indigo-600">Procog</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto md:mx-0">
              Empowering risk management collaboration through innovative
              solutions and data-driven insights.
            </p>
          </div>

          {/* Links Section */}
          <div className="flex justify-center md:justify-start">
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all duration-300 inline-block"
                >
                  About
                </a>
              </li>
              <li>
                <Link
                  href="/guide"
                  className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all duration-300 inline-block"
                >
                  User Guide
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all duration-300 inline-block"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all duration-300 inline-block"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="flex flex-col items-center md:items-end space-y-6">
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-white p-3 rounded-lg shadow-sm border border-indigo-100 transform transition hover:bg-indigo-600 hover:text-white hover:-translate-y-1 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500"
                aria-label="Facebook"
              >
                <FaFacebookF size={20} />
              </a>
              <a
                href="#"
                className="bg-white p-3 rounded-lg shadow-sm border border-indigo-100 transform transition hover:bg-indigo-600 hover:text-white hover:-translate-y-1 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                className="bg-white p-3 rounded-lg shadow-sm border border-indigo-100 transform transition hover:bg-indigo-600 hover:text-white hover:-translate-y-1 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={20} />
              </a>
            </div>
            <div className="text-sm text-gray-500">
              Connect with us on social media
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-indigo-100 text-sm text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500">
              &copy; 2025 Procog. All rights reserved.
            </p>
            <div className="text-indigo-400 text-xs">
              Made with ❤️ for better risk management
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
