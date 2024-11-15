import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Procog
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto md:mx-0">
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
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50 px-4 py-2 rounded-lg transition-all duration-300 inline-block"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50 px-4 py-2 rounded-lg transition-all duration-300 inline-block"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50 px-4 py-2 rounded-lg transition-all duration-300 inline-block"
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
                className="bg-gray-800/50 p-3 rounded-lg hover:bg-blue-600 hover:text-white transform hover:-translate-y-1 transition-all duration-300"
                aria-label="Facebook"
              >
                <FaFacebookF size={20} />
              </a>
              <a
                href="#"
                className="bg-gray-800/50 p-3 rounded-lg hover:bg-blue-600 hover:text-white transform hover:-translate-y-1 transition-all duration-300"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                className="bg-gray-800/50 p-3 rounded-lg hover:bg-blue-600 hover:text-white transform hover:-translate-y-1 transition-all duration-300"
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
        <div className="mt-12 pt-8 border-t border-gray-800/50 text-sm text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500">
              &copy; 2024 Procog. All rights reserved.
            </p>
            <div className="text-gray-600 text-xs">
              Made with ❤️ for better risk management
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
