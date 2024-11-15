import { FC } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection: FC = () => (
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
        Our platform empowers you to identify, assess, and mitigate risks with
        ease. Get started today and take control of your organization&apos;s
        future.
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
      </motion.div>
    </div>
  </motion.div>
);

export default HeroSection;
