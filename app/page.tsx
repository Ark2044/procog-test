"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/Auth";
import FeatureCard from "@/components/layout/FeatureCard";
import BenefitCard from "@/components/layout/BenefitCard";
import HeroSection from "@/components/layout/HeroSection";
import {
  BarChart3,
  Shield,
  Settings,
  CheckCircle,
  Briefcase,
  Clipboard,
  ArrowRight,
  Globe,
} from "lucide-react";

const LoadingSpinner = () => (
  <motion.div
    className="flex flex-col items-center justify-center min-h-screen text-white space-y-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="loader"
      animate={{
        rotate: 360,
        transition: {
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        },
      }}
    />
    <motion.p
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-xl font-semibold"
    >
      Preparing your experience...
    </motion.p>
  </motion.div>
);

const HomePage = () => {
  const router = useRouter();
  const { session, verifySession, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await verifySession();
      } catch (err) {
        console.error(err);
        setError("Failed to verify session. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [verifySession]);

  useEffect(() => {
    if (session && user) {
      router.push(`/dashboard/${user.$id}`);
    }
  }, [session, user, router]);

  const features = useMemo(
    () => [
      {
        icon: BarChart3,
        title: "Advanced Analytics",
        description:
          "Gain deep, actionable insights with our powerful analytics engine.",
        color: "from-blue-400 to-indigo-600",
      },
      {
        icon: Shield,
        title: "Risk Mitigation",
        description:
          "Proactively identify and mitigate potential risks before they escalate.",
        color: "from-emerald-400 to-teal-600",
      },
      {
        icon: Settings,
        title: "Customizable Platform",
        description:
          "Tailor the platform to your unique business needs and workflows.",
        color: "from-purple-400 to-pink-600",
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
      },
      {
        icon: Briefcase,
        title: "Enhanced Decision-Making",
        description:
          "Leverage data-driven insights for strategic business decisions.",
      },
      {
        icon: Clipboard,
        title: "Centralized Management",
        description:
          "Consolidate and manage all your risk information in one platform.",
      },
    ],
    []
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen text-red-500 text-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Globe className="w-24 h-24 mb-4 text-red-500" />
        <h2 className="text-3xl font-bold mb-4">Oops! Something Went Wrong</h2>
        <p className="text-xl mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
        >
          Retry <ArrowRight className="ml-2" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HeroSection />

      {/* Features Section */}
      <motion.section
        className="py-32 container mx-auto px-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-5xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.2,
                }}
                viewport={{ once: true }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="py-32 container mx-auto px-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-5xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">
          Key Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence>
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.2,
                }}
                viewport={{ once: true }}
              >
                <BenefitCard {...benefit} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="py-20 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h3 className="text-3xl font-bold mb-4">
          Ready to Elevate Your Experience?
        </h3>
        <p className="text-lg mb-6">
          Join us today and unlock the full potential of our platform.
        </p>
        <button
          onClick={() => router.push("/register")}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Sign Up Now
        </button>
      </motion.section>
    </motion.div>
  );
};

export default HomePage;
