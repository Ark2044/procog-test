'use client';
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  BookOpen,
  X,
  ChevronRight,
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

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
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

  const closeGuide = () => {
    setIsOpen(false);
    setCurrentStep(0);
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
            >
              <HelpCircle size={24} />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left">
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
            className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-80 md:w-96 overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center">
                <BookOpen className="mr-2" size={18} />
                User Guide
              </h3>
              <button
                onClick={closeGuide}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`p-3 rounded-full mb-4 ${steps[currentStep].color} bg-opacity-10`}
                >
                  {React.createElement(steps[currentStep].icon, {
                    size: 32,
                    className: steps[currentStep].color,
                  })}
                </div>
                <h4 className="text-xl font-bold mb-2 text-gray-800">
                  {steps[currentStep].title}
                </h4>
                <p className="text-gray-600 mb-6">
                  {steps[currentStep].content}
                </p>
              </motion.div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-400 text-sm">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <Button
                  onClick={nextStep}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {currentStep === steps.length - 1 ? "Finish" : "Next"}
                  <ChevronRight className="ml-1" size={16} />
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
