"use client";
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/layout/HeroSection";
import {
  BarChart3,
  Shield,
  Settings,
  CheckCircle,
  Briefcase,
  Clipboard,
} from "lucide-react";

const HomePage = () => {
  const router = useRouter();

  const features = useMemo(
    () => [
      {
        icon: BarChart3,
        title: "Advanced Analytics",
        description:
          "Gain deep, actionable insights with our powerful analytics engine.",
        bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
        textColor: "text-indigo-700",
        borderColor: "border-indigo-200",
        iconColor: "#6366F1",
      },
      {
        icon: Shield,
        title: "Risk Mitigation",
        description:
          "Proactively identify and mitigate potential risks before they escalate.",
        bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
        textColor: "text-purple-700",
        borderColor: "border-purple-200",
        iconColor: "#8B5CF6",
      },
      {
        icon: Settings,
        title: "Customizable Platform",
        description:
          "Tailor the platform to your unique business needs and workflows.",
        bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
        iconColor: "#3B82F6",
      },
    ],
    []
  );

  const benefits = useMemo(
    () => [
      {
        icon: CheckCircle,
        title: "Streamlined Compliance",
        description:
          "Ensure regulatory compliance with automated tracking and reporting.",
        bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
        textColor: "text-rose-700",
        borderColor: "border-rose-200",
        iconColor: "#F43F5E",
      },
      {
        icon: Briefcase,
        title: "Enhanced Decision-Making",
        description:
          "Leverage data-driven insights for strategic business decisions.",
        bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
        iconColor: "#F59E0B",
      },
      {
        icon: Clipboard,
        title: "Centralized Management",
        description:
          "Consolidate and manage all your risk information in one platform.",
        bgColor: "bg-gradient-to-br from-cyan-50 to-sky-50",
        textColor: "text-cyan-700",
        borderColor: "border-cyan-200",
        iconColor: "#06B6D4",
      },
    ],
    []
  );

  return (
    <motion.div
      className="min-h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: "linear-gradient(to bottom, #F9FAFB, #F3F4F6)",
      }}
    >
      <HeroSection />

      {/* Features Section */}
      <motion.section
        className="py-16 sm:py-24 md:py-32 container mx-auto px-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-8 sm:mb-12 md:mb-16 text-gray-800">
          Key Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 15px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div
                  className={`p-4 sm:p-6 rounded-xl ${feature.bgColor} border ${feature.borderColor} shadow-sm hover:shadow-md transition-shadow duration-300`}
                >
                  <feature.icon
                    className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4"
                    style={{ color: feature.iconColor }}
                  />
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className={`${feature.textColor} text-sm sm:text-base`}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="py-16 sm:py-24 md:py-32 container mx-auto px-4 bg-white shadow-inner"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-8 sm:mb-12 md:mb-16 text-gray-800">
          Key Benefits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence>
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 15px rgba(0, 0, 0, 0.05)",
                }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`p-4 sm:p-6 rounded-xl ${benefit.bgColor} shadow-md border ${benefit.borderColor}`}
              >
                <benefit.icon
                  className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4"
                  style={{ color: benefit.iconColor }}
                />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
                  {benefit.title}
                </h3>
                <p className={`${benefit.textColor} text-sm sm:text-base`}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="py-12 sm:py-16 md:py-20 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div
          className="py-10 sm:py-16 px-4 sm:px-8 rounded-3xl mx-auto max-w-4xl shadow-lg border border-indigo-100"
          style={{
            background: "linear-gradient(135deg, #F5F3FF, #EFF6FF, #EEF2FF)",
          }}
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-800 px-2">
            Ready to Elevate Your Experience?
          </h3>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-gray-600 px-2">
            Join us today and unlock the full potential of our platform.
          </p>
          <motion.button
            onClick={() => router.push("/register")}
            className="px-6 sm:px-10 py-3 sm:py-5 rounded-xl font-bold text-base sm:text-lg text-white shadow-md focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 w-full sm:w-auto"
            style={{
              background: "linear-gradient(to right, #6366F1, #8B5CF6)",
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 25px rgba(99,102,241,0.4)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            Sign Up Now
          </motion.button>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default HomePage;
