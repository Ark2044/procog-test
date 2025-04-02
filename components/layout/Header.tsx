"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/Auth";
import {
  FaSignInAlt,
  FaUserPlus,
  FaUser,
  FaUserCog,
  FaSignOutAlt,
  FaTable,
  FaBell,
  FaQuestionCircle,
} from "react-icons/fa";

export default function Header() {
  const { session, logout, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  return (
    <header
      className={`fixed w-full top-0 z-20 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md"
          : "bg-gradient-to-r from-indigo-50 to-purple-50 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-6 py-4 lg:px-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className={`text-2xl lg:text-3xl font-extrabold transition duration-300 ${
              isScrolled
                ? "text-indigo-700"
                : "text-indigo-600 hover:text-indigo-800"
            }`}
          >
            PROCOG
          </Link>

          <button
            onClick={toggleMenu}
            className={`lg:hidden transition-colors duration-200 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 ${
              isScrolled
                ? "text-indigo-600"
                : "text-indigo-700 hover:text-indigo-900"
            }`}
            aria-label="Toggle navigation menu"
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
                ? "bg-white shadow-md"
                : "bg-white/90 lg:bg-transparent"
            }`}
          >
            <ul className="flex flex-col lg:flex-row items-center lg:space-x-4 lg:space-y-0 space-y-4 py-4 lg:py-0">
              <li>
                <Link
                  href="/guide"
                  className={`flex items-center transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium border ${
                    isScrolled
                      ? "border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                      : "border-indigo-400 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  <FaQuestionCircle className="mr-2 text-lg" />
                  User Guide
                </Link>
              </li>

              {!session ? (
                <>
                  <li>
                    <Link
                      href="/login"
                      className={`flex items-center transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium border ${
                        isScrolled
                          ? "border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                          : "border-indigo-400 text-indigo-700 hover:bg-indigo-100"
                      }`}
                    >
                      <FaSignInAlt className="mr-2 text-lg" />
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md text-white"
                    >
                      <FaUserPlus className="mr-2 text-lg" />
                      Sign Up
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    {user?.prefs?.role === "admin" ? (
                      <Link
                        href="/admin/users"
                        className={`flex items-center transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium border ${
                          isScrolled
                            ? "border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                            : "border-indigo-400 text-indigo-700 hover:bg-indigo-100"
                        }`}
                      >
                        <FaUserCog className="mr-2 text-lg" />
                        Admin
                      </Link>
                    ) : (
                      <Link
                        href={user ? `/dashboard/${user.$id}` : "#"}
                        className={`flex items-center transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium border ${
                          isScrolled
                            ? "border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                            : "border-indigo-400 text-indigo-700 hover:bg-indigo-100"
                        }`}
                      >
                        <FaTable className="mr-2 text-lg" />
                        Dashboard
                      </Link>
                    )}
                  </li>
                  <li>
                    <Link
                      href="/reminders"
                      className={`flex items-center transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium border ${
                        isScrolled
                          ? "border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                          : "border-indigo-400 text-indigo-700 hover:bg-indigo-100"
                      }`}
                    >
                      <FaBell className="mr-2 text-lg" />
                      Reminders
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/profile/${session.userId}`}
                      className={`flex items-center transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium border ${
                        isScrolled
                          ? "border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                          : "border-indigo-400 text-indigo-700 hover:bg-indigo-100"
                      }`}
                    >
                      <FaUser className="mr-2 text-lg" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => logout()}
                      className={`flex items-center transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium border ${
                        isScrolled
                          ? "border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                          : "border-indigo-400 text-indigo-700 hover:bg-indigo-100"
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
