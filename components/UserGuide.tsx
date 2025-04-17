"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  BookOpen,
  X,
  ChevronRight,
  ChevronLeft,
  Shield,
  AlertTriangle,
  UserCheck,
  Sliders,
  FileText,
  BarChart2,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface UserGuideProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

const UserGuide: React.FC<UserGuideProps> = ({ position = "bottom-right" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const positionClasses = {
    "bottom-right": "bottom-4 right-4 sm:bottom-6 sm:right-6",
    "bottom-left": "bottom-4 left-4 sm:bottom-6 sm:left-6",
    "top-right": "top-4 right-4 sm:top-6 sm:right-6",
    "top-left": "top-4 left-4 sm:top-6 sm:left-6",
  };

  const steps = [
    {
      title: "Welcome to Risk Management System",
      content:
        "This guide will help you navigate through the key features of our platform.",
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      title: "Dashboard",
      content:
        "Your dashboard provides an overview of all risks, statistics, and quick access to create new entries.",
      icon: BarChart2,
      color: "text-indigo-500",
    },
    {
      title: "Creating a Risk",
      content:
        "Click on the 'Create Risk' button on your dashboard to register new risks with details like impact, probability, and mitigation strategies.",
      icon: AlertTriangle,
      color: "text-orange-500",
    },
    {
      title: "Risk Management",
      content:
        "View individual risk details by clicking on a risk from your dashboard. Here you can update status, add comments, and track changes.",
      icon: Shield,
      color: "text-purple-500",
    },
    {
      title: "Profile Settings",
      content:
        "Manage your account preferences, notification settings, and department information in the profile section.",
      icon: UserCheck,
      color: "text-green-500",
    },
    {
      title: "Department Views",
      content:
        "Filter risks by department to focus on relevant entries for your team.",
      icon: Sliders,
      color: "text-cyan-500",
    },
    {
      title: "Reports & Documentation",
      content:
        "Generate reports and documentation for your risk management activities through the reporting section.",
      icon: FileText,
      color: "text-pink-500",
    },
  ];

  const toggleGuide = () => setIsOpen(!isOpen);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeGuide = () => {
    setIsOpen(false);
    setCurrentStep(0);
  };

  // Determine guide position based on screen size and selected position
  const getGuidePosition = () => {
    if (isMobile) {
      // On mobile, always position at the bottom with full width
      return "bottom-20 left-2 right-2 mx-auto";
    }

    // On larger screens, use the provided position
    switch (position) {
      case "bottom-right":
        return "bottom-20 right-4 lg:right-6";
      case "bottom-left":
        return "bottom-20 left-4 lg:left-6";
      case "top-right":
        return "top-20 right-4 lg:right-6";
      case "top-left":
        return "top-20 left-4 lg:left-6";
      default:
        return "bottom-20 right-4 lg:right-6";
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={toggleGuide}
              className={`fixed ${positionClasses[position]} z-50 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open User Guide"
            >
              <HelpCircle size={24} />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side={isMobile ? "top" : "left"}>
            <p>User Guide</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed ${getGuidePosition()} z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-full sm:w-[90%] md:w-[450px] lg:w-[500px] max-w-[95vw] overflow-hidden`}
          >
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center text-sm sm:text-base">
                <BookOpen className="mr-2" size={isMobile ? 16 : 18} />
                User Guide
              </h3>
              <button
                onClick={closeGuide}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Close guide"
              >
                <X size={isMobile ? 16 : 18} />
              </button>
            </div>

            <div className="p-3 sm:p-5">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`p-2 sm:p-3 rounded-full mb-3 sm:mb-4 ${steps[currentStep].color} bg-opacity-10`}
                >
                  {React.createElement(steps[currentStep].icon, {
                    size: isMobile ? 24 : 32,
                    className: steps[currentStep].color,
                  })}
                </div>
                <h4 className="text-lg sm:text-xl font-bold mb-2 text-gray-800">
                  {steps[currentStep].title}
                </h4>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  {steps[currentStep].content}
                </p>
              </motion.div>

              <div className="flex justify-between items-center mt-2 sm:mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    className={`${
                      currentStep === 0 ? "opacity-50" : ""
                    } h-8 sm:h-10`}
                    aria-label="Previous step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                    {currentStep + 1} / {steps.length}
                  </span>
                </div>
                <Button
                  onClick={nextStep}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 sm:h-10"
                  size={isMobile ? "sm" : "default"}
                  aria-label={
                    currentStep === steps.length - 1
                      ? "Finish guide"
                      : "Next step"
                  }
                >
                  {currentStep === steps.length - 1 ? "Finish" : "Next"}
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserGuide;
