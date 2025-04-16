"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaShieldAlt, FaChartLine, FaUsers, FaGlobe } from "react-icons/fa";

const AboutPage = () => {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white text-gray-800 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
            About Procog
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
            We&apos;re on a mission to revolutionize risk management through
            innovative solutions that empower organizations to identify, assess,
            and mitigate risks effectively.
          </p>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-indigo-100 shadow-sm">
            <p className="text-gray-600 italic">
              &quot;Procog stands at the intersection of cutting-edge technology and
              enterprise risk management, providing a platform that transforms
              how organizations handle risk.&quot;
            </p>
            <p className="mt-4 font-medium text-gray-700">
              - Alex Richardson, CEO & Founder
            </p>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Our Story
                </h2>
                <p className="text-gray-600 mb-4">
                  Founded in 2019, Procog emerged from a simple observation:
                  organizations struggled with disconnected risk management
                  systems that hindered effective collaboration and insight.
                </p>
                <p className="text-gray-600">
                  Our team of risk management experts and software engineers
                  came together to build a comprehensive platform that brings
                  clarity to complex risk landscapes, enabling teams to make
                  informed decisions with confidence.
                </p>
              </div>
              <div className="bg-indigo-100 flex items-center justify-center p-8">
                <div className="relative h-64 w-full">
                  <Image
                    src="/globe.svg"
                    alt="Global Risk Management"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-start">
                <div className="mr-4 bg-blue-100 p-3 rounded-lg">
                  <FaShieldAlt className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    Security First
                  </h3>
                  <p className="text-gray-600">
                    We prioritize enterprise-grade security in everything we do,
                    protecting your sensitive risk data with industry-leading
                    standards.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-start">
                <div className="mr-4 bg-green-100 p-3 rounded-lg">
                  <FaChartLine className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    Data-Driven Insights
                  </h3>
                  <p className="text-gray-600">
                    We believe in the power of data to transform risk
                    management, providing actionable insights that drive better
                    decisions.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-start">
                <div className="mr-4 bg-purple-100 p-3 rounded-lg">
                  <FaUsers className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    Collaborative Approach
                  </h3>
                  <p className="text-gray-600">
                    We design our platform to enhance collaboration across
                    departments, breaking down silos for a unified risk
                    management strategy.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-start">
                <div className="mr-4 bg-yellow-100 p-3 rounded-lg">
                  <FaGlobe className="text-yellow-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    Global Perspective
                  </h3>
                  <p className="text-gray-600">
                    We understand that risks transcend borders, providing
                    solutions that address global risk management challenges.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Team Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Our Leadership Team
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full overflow-hidden">
                {/* Note: Replace with actual team member images */}
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-500 font-bold text-xl">AR</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">
                Alex Richardson
              </h3>
              <p className="text-indigo-600 mb-3">CEO & Founder</p>
              <p className="text-gray-600 text-sm">
                Former risk consultant with 15+ years experience in enterprise
                risk management.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-500 font-bold text-xl">SM</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">
                Sarah Mitchell
              </h3>
              <p className="text-indigo-600 mb-3">CTO</p>
              <p className="text-gray-600 text-sm">
                Software engineer with expertise in building enterprise SaaS
                solutions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-500 font-bold text-xl">JL</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">James Lee</h3>
              <p className="text-indigo-600 mb-3">Head of Product</p>
              <p className="text-gray-600 text-sm">
                Product strategist focused on creating intuitive user
                experiences.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl p-8 shadow-md"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Our Mission</h2>
            <p className="text-lg leading-relaxed text-center">
              To empower organizations of all sizes with intelligent risk
              management tools that transform uncertainty into strategic
              advantage, helping them build resilience in an increasingly
              complex world.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
