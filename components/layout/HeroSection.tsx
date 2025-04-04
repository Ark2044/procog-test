"use client";
import { FC } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const HeroSection: FC = () => (
  <motion.div
    className="container mx-auto px-4 pt-28 sm:pt-32 pb-16 sm:pb-20 rounded-xl relative overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    style={{
      background: "linear-gradient(135deg, #EEF2FF, #F5F3FF, #EFF6FF)",
    }}
  >
    <div className="max-w-4xl mx-auto text-center relative">
      {/* Decorative elements */}
      <motion.div
        className="absolute -top-20 left-1/4 hidden sm:block"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles style={{ color: "#6366F1" }} className="w-10 h-10" />
      </motion.div>

      <motion.div
        className="absolute -top-10 right-1/4 hidden sm:block"
        animate={{
          y: [0, -20, 0],
          rotate: [0, -5, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <Sparkles style={{ color: "#8B5CF6" }} className="w-8 h-8" />
      </motion.div>

      <motion.h1
        className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-8 px-2"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ textShadow: "0 2px 8px rgba(99,102,241,0.15)" }}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Effortlessly Manage Your Risks
        </span>
      </motion.h1>

      <motion.p
        className="text-lg sm:text-xl mb-8 sm:mb-12 text-gray-700 px-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Our platform empowers you to identify, assess, and mitigate risks with
        ease. Get started today and take control of your organization&apos;s
        future.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.button
          className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl overflow-hidden shadow-lg w-full sm:w-auto"
          style={{
            background: "linear-gradient(to right, #6366F1, #8B5CF6)",
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 20px rgba(99,102,241,0.4)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
          <span className="relative flex items-center justify-center font-bold text-white text-lg">
            <Link href="/register">Get Started</Link>
            <ArrowRight className="ml-2 h-5 w-5" />
          </span>
        </motion.button>

        <motion.button
          className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl overflow-hidden shadow-md w-full sm:w-auto"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "2px solid #E0E7FF",
          }}
          whileHover={{
            scale: 1.05,
            borderColor: "#6366F1",
            boxShadow: "0 0 20px rgba(99,102,241,0.2)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative flex items-center justify-center font-bold text-indigo-700 text-lg">
            <Link href="/demo">Watch Demo</Link>
          </span>
        </motion.button>
      </motion.div>

      <motion.div
        className="absolute -bottom-10 sm:-bottom-16 left-1/2 transform -translate-x-1/2 px-4 sm:px-6 py-2 rounded-full bg-white/90 border border-indigo-100 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span className="font-bold text-sm sm:text-base text-indigo-600">
          Trusted by 500+ Companies Worldwide
        </span>
      </motion.div>
    </div>
  </motion.div>
);

export default HeroSection;
