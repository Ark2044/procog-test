"use client";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/Auth";
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
    className="flex flex-col items-center justify-center min-h-screen space-y-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    style={{ background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)" }}
  >
    <motion.div
      className="loader"
      animate={{
        rotate: 360,
        transition: { repeat: Infinity, duration: 1, ease: "linear" },
      }}
      style={{
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        border: "8px solid transparent",
        borderTopColor: "#6366F1",
        borderBottomColor: "#8B5CF6",
      }}
    />
    <motion.p
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-xl font-bold text-indigo-700"
    >
      Preparing your experience...
    </motion.p>
  </motion.div>
);

const HomePage = () => {
  const router = useRouter();
  const { session, verifySession, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verify session and mark session as checked when done.
  useEffect(() => {
    const checkSession = async () => {
      try {
        await verifySession();
      } catch (err) {
        console.error(err);
        setError("Failed to verify session. Please try again.");
      } finally {
        setSessionChecked(true);
        setLoading(false);
      }
    };
    checkSession();
  }, [verifySession]);

  // Only trigger redirect after session has been checked.
  useEffect(() => {
    if (sessionChecked) {
      if (!session) {
        router.push("/login");
      } else if (user) {
        router.push(`/dashboard/${user.$id}`);
      }
    }
  }, [sessionChecked, session, user, router]);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen text-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ background: "linear-gradient(135deg, #F5F3FF, #EFF6FF)" }}
      >
        <Globe className="w-24 h-24 mb-4 text-indigo-500" />
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          Oops! Something Went Wrong
        </h2>
        <p className="text-xl mb-6 text-purple-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 font-bold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition flex items-center text-white focus:outline-none focus-visible:ring focus-visible:ring-indigo-500"
        >
          Retry <ArrowRight className="ml-2" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ background: "linear-gradient(to bottom, #F9FAFB, #F3F4F6)" }}
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
        <h2 className="text-5xl font-extrabold text-center mb-16 text-gray-800">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  className={`p-6 rounded-xl ${feature.bgColor} border ${feature.borderColor} shadow-sm hover:shadow-md transition-shadow duration-300`}
                >
                  <feature.icon
                    className="w-12 h-12 mb-4"
                    style={{ color: feature.iconColor }}
                  />
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className={`${feature.textColor}`}>
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
        className="py-32 container mx-auto px-4 bg-white shadow-inner"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-5xl font-extrabold text-center mb-16 text-gray-800">
          Key Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                className={`p-6 rounded-xl ${benefit.bgColor} shadow-md border ${benefit.borderColor}`}
              >
                <benefit.icon
                  className="w-12 h-12 mb-4"
                  style={{ color: benefit.iconColor }}
                />
                <h3 className="text-2xl font-bold mb-2 text-gray-800">
                  {benefit.title}
                </h3>
                <p className={`${benefit.textColor}`}>{benefit.description}</p>
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
        <div
          className="py-16 px-8 rounded-3xl mx-auto max-w-4xl shadow-lg border border-indigo-100"
          style={{
            background: "linear-gradient(135deg, #F5F3FF, #EFF6FF, #EEF2FF)",
          }}
        >
          <h3 className="text-4xl font-bold mb-6 text-gray-800">
            Ready to Elevate Your Experience?
          </h3>
          <p className="text-xl mb-8 text-gray-600">
            Join us today and unlock the full potential of our platform.
          </p>
          <motion.button
            onClick={() => router.push("/register")}
            className="px-10 py-5 rounded-xl font-bold text-lg text-white shadow-md focus:outline-none focus-visible:ring focus-visible:ring-indigo-500"
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
