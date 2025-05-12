"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Shield,
  Settings,
  CheckCircle,
  Briefcase,
  Clipboard,
  ArrowRight,
} from "lucide-react";

const HomePage = () => {
  const router = useRouter();

  // Define consistent card styling
  const cardBgColor = "bg-white/80 backdrop-blur-sm"; // Semi-transparent white with blur
  const cardBorderColor = "border-blue-200";
  const cardTextColor = "text-slate-600"; // Use a neutral dark color for description
  const cardTitleColor = "text-gray-800"; // Keep titles dark

  // FIXED: Use a single blue gradient for the entire page
  const pageBackgroundStyle = {
    background:
      "linear-gradient(135deg, #EFF6FF 30%, #E0F2FE 70%, #CFFAFE 100%)", // Light Blue -> Lighter Sky -> Lightest Cyan
  };

  // Button styles
  const buttonBackgroundStyle = {
    background: "linear-gradient(to right, #3B82F6, #0EA5E9)", // Blue-500 to Sky-500
  };
  const buttonShadowStyle = {
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)", // Blue shadow
  };

  const features = useMemo(
    () => [
      {
        icon: BarChart3,
        title: "Advanced Analytics",
        description:
          "Gain deep, actionable insights with our powerful analytics engine.",
        bgColor: cardBgColor,
        textColor: cardTextColor,
        borderColor: cardBorderColor,
        iconColor: "#3B82F6", // Blue
      },
      {
        icon: Shield,
        title: "Risk Mitigation",
        description:
          "Proactively identify and mitigate potential risks before they escalate.",
        bgColor: cardBgColor,
        textColor: cardTextColor,
        borderColor: cardBorderColor,
        iconColor: "#0EA5E9", // Sky Blue
      },
      {
        icon: Settings,
        title: "Customizable Platform",
        description:
          "Tailor the platform to your unique business needs and workflows.",
        bgColor: cardBgColor,
        textColor: cardTextColor,
        borderColor: cardBorderColor,
        iconColor: "#06B6D4", // Cyan
      },
    ],
    [cardBgColor, cardTextColor, cardBorderColor]
  );

  const benefits = useMemo(
    () => [
      {
        icon: CheckCircle,
        title: "Streamlined Compliance",
        description:
          "Ensure regulatory compliance with automated tracking and reporting.",
        bgColor: cardBgColor,
        textColor: cardTextColor,
        borderColor: cardBorderColor,
        iconColor: "#22C55E", // Green
      },
      {
        icon: Briefcase,
        title: "Enhanced Decision-Making",
        description:
          "Leverage data-driven insights for strategic business decisions.",
        bgColor: cardBgColor,
        textColor: cardTextColor,
        borderColor: cardBorderColor,
        iconColor: "#0EA5E9", // Sky Blue
      },
      {
        icon: Clipboard,
        title: "Centralized Management",
        description:
          "Consolidate and manage all your risk information in one platform.",
        bgColor: cardBgColor,
        textColor: cardTextColor,
        borderColor: cardBorderColor,
        iconColor: "#06B6D4", // Cyan
      },
    ],
    [cardBgColor, cardTextColor, cardBorderColor]
  );

  return (
    <div style={pageBackgroundStyle} className="w-full min-h-screen">
      {/* Added pt-16 to create space below the header */}
      <div className="container mx-auto px-4 py-8 pt-12 sm:pt-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12 mt-4 sm:mt-8">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 px-2"
            style={{ textShadow: "0 2px 8px rgba(59, 130, 246, 0.15)" }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-600">
              Effortlessly Manage Your Risks
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 md:mb-8 text-gray-700 max-w-3xl mx-auto px-2">
            Our platform empowers you to identify, assess, and mitigate risks
            with ease. Get started today and take control of your
            organization&apos;s future.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center px-4 sm:px-0">
            <motion.button
              className="group relative px-5 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl overflow-hidden shadow-lg w-full sm:w-auto"
              style={{ ...buttonBackgroundStyle, ...buttonShadowStyle }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center justify-center font-bold text-white text-base md:text-lg">
                <Link href="/login" className="block w-full text-center">
                  Get Started
                </Link>
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
              </span>
            </motion.button>
          </div>
        </div>

        {/* Features Section */}
        <section className="mb-8 sm:mb-12">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-extrabold text-center mb-4 sm:mb-6 ${cardTitleColor}`}
          >
            Key Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`p-3 sm:p-4 md:p-5 rounded-xl border shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col ${feature.bgColor} ${feature.borderColor}`}
              >
                <feature.icon
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-2 sm:mb-3 flex-shrink-0"
                  style={{ color: feature.iconColor }}
                />
                <h3 className={`text-base sm:text-lg font-bold mb-1 sm:mb-2 ${cardTitleColor}`}>
                  {feature.title}
                </h3>
                <p className={`${feature.textColor} text-xs sm:text-sm leading-relaxed`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-8 sm:mb-12">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-extrabold text-center mb-4 sm:mb-6 ${cardTitleColor}`}
          >
            Key Benefits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`p-3 sm:p-4 md:p-5 rounded-xl border shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col ${benefit.bgColor} ${benefit.borderColor}`}
              >
                <benefit.icon
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-2 sm:mb-3 flex-shrink-0"
                  style={{ color: benefit.iconColor }}
                />
                <h3 className={`text-base sm:text-lg font-bold mb-1 sm:mb-2 ${cardTitleColor}`}>
                  {benefit.title}
                </h3>
                <p className={`${benefit.textColor} text-xs sm:text-sm leading-relaxed`}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action - Minimal bottom margin */}
        <section className="mb-4">
          <div className="py-4 sm:py-6 px-3 sm:px-6 rounded-xl mx-auto max-w-3xl shadow-md bg-white/80 backdrop-blur-sm border border-blue-200">
            <h3
              className={`text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 ${cardTitleColor} text-center`}
            >
              Ready to Elevate Your Experience?
            </h3>
            <p className="text-sm sm:text-base mb-3 sm:mb-4 md:mb-6 text-gray-600 max-w-xl mx-auto text-center">
              Join us today and unlock the full potential of our platform.
            </p>
            <div className="flex justify-center">
              <motion.button
                onClick={() => router.push("/register")}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base text-white shadow-md focus:outline-none focus-visible:ring focus-visible:ring-blue-500 w-full sm:w-auto max-w-xs mx-auto"
                style={buttonBackgroundStyle}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign Up Now
              </motion.button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;