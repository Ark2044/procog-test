"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/Auth";
import { FaSignInAlt, FaUserPlus, FaUser, FaSignOutAlt } from "react-icons/fa";

export default function Header() {
  const { session, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  return (
    <header
      className={`fixed w-full top-0 z-20 transition-all duration-300 ${
        isScrolled
          ? "bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 shadow-lg" // After scroll
          : "bg-transparent text-gray-700" // Before scroll
      }`}
    >
      <div className="container mx-auto px-6 py-4 lg:px-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className={`text-2xl lg:text-3xl font-extrabold bg-clip-text transition duration-300 ${
              isScrolled
                ? "text-white" // Text color after scroll
                : "text-transparent bg-gradient-to-r from-blue-500 to-indigo-700 hover:from-indigo-600 hover:to-purple-800"
            }`}
          >
            PROCOG
          </Link>

          <button
            onClick={toggleMenu}
            className={`lg:hidden transition-colors duration-200 focus:outline-none ${
              isScrolled ? "text-white" : "text-gray-700 hover:text-indigo-600"
            }`}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>

          <nav
            className={`lg:flex lg:items-center lg:space-x-6 ${
              isOpen ? "block" : "hidden"
            } transition-all duration-300 ease-in-out absolute lg:relative top-full left-0 w-full lg:w-auto ${
              isScrolled
                ? "bg-gradient-to-b from-gray-900 to-gray-950 shadow-lg text-gray-300"
                : "bg-white lg:bg-transparent"
            }`}
          >
            <ul className="flex flex-col lg:flex-row items-center lg:space-x-4 lg:space-y-0 space-y-4 py-4 lg:py-0">
              {!session ? (
                <>
                  <li>
                    <Link
                      href="/login"
                      className={`flex items-center transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium border border-indigo-600 ${
                        isScrolled
                          ? "text-white hover:bg-indigo-800"
                          : "text-indigo-600 hover:bg-indigo-100"
                      }`}
                    >
                      <FaSignInAlt className="mr-2 text-lg" />
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="flex items-center text-white bg-indigo-600 hover:bg-indigo-800 transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <FaUserPlus className="mr-2 text-lg" />
                      Sign Up
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href={`/profile/${session.userId}`}
                      className={`flex items-center transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium border border-indigo-600 ${
                        isScrolled
                          ? "text-white hover:bg-indigo-800"
                          : "text-indigo-600 hover:bg-indigo-100"
                      }`}
                    >
                      <FaUser className="mr-2 text-lg" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => logout()}
                      className={`flex items-center transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium border border-indigo-600 ${
                        isScrolled
                          ? "text-white hover:bg-indigo-800"
                          : "text-indigo-600 hover:bg-indigo-100"
                      }`}
                    >
                      <FaSignOutAlt className="mr-2 text-lg" />
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
