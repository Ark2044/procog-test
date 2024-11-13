"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Shield,
  Settings,
  CheckCircle,
  BriefcaseIcon,
  ClipboardList,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();
  const { session, verifySession } = useAuthStore();
  React.useEffect(() => {
    verifySession();
  }, [verifySession]);
  React.useEffect(() => {
    if (session) {
      const user = useAuthStore.getState().user;
      router.push(`/dashboard/${user?.$id}`);
    }
  }, [session, router]);

  const features = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Gain valuable insights through our comprehensive analytics dashboard, helping you make data-driven decisions.",
      color: "from-blue-400 to-indigo-600",
    },
    {
      icon: Shield,
      title: "Risk Mitigation",
      description:
        "Proactively identify and mitigate risks, ensuring your organization is prepared for potential challenges.",
      color: "from-emerald-400 to-teal-600",
    },
    {
      icon: Settings,
      title: "Customizable Settings",
      description:
        "Tailor the platform to your unique needs with our flexible settings, ensuring a seamless experience.",
      color: "from-purple-400 to-pink-600",
    },
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: "Streamlined Compliance",
      description:
        "Ensure your organization remains compliant with industry regulations and standards.",
    },
    {
      icon: BriefcaseIcon,
      title: "Improved Decision-Making",
      description:
        "Make informed decisions based on comprehensive risk data and analysis.",
    },
    {
      icon: ClipboardList,
      title: "Centralized Risk Management",
      description:
        "Consolidate all your risk-related information and activities in one convenient platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      <div className="relative">
        <motion.div
          className="container mx-auto px-4 pt-32 pb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              className="absolute -top-20 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-12 h-12 text-blue-400" />
            </motion.div>
            <motion.h1
              className="text-6xl md:text-7xl font-bold mb-8"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Effortlessly Manage Your Risks
              </span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-300 mb-12"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Our platform empowers you to identify, assess, and mitigate risks
              with ease. Get started today and take control of your
              organization&apos;s future.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.button
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                <span className="relative flex items-center justify-center">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </motion.button>
              <motion.button
                className="group px-8 py-4 border border-white/20 rounded-xl relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                <span className="relative">Pricing</span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <div className="relative py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4">Key Features</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <div className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <div
                    className={`inline-block p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative py-32 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4">Key Benefits</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="group perspective"
                initial={{ opacity: 0, rotateX: 45 }}
                whileInView={{ opacity: 1, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-y-12">
                  <div className="mb-6">
                    <benefit.icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative py-32 bg-gradient-to-t from-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
          </motion.div>
          <div className="flex justify-center gap-8">
            <motion.div
              className="w-full sm:w-1/2 lg:w-1/3"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative p-8 bg-white/5 border border-white/10 rounded-xl">
                <blockquote className="text-gray-400 mb-6">
                  “This platform has been a game-changer in how we manage risk
                  and ensure compliance. Highly recommend!”
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500 mr-4"></div>
                  <div>
                    <p className="font-semibold text-white">John Doe</p>
                    <p className="text-gray-500">CEO, Tech Corp</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
