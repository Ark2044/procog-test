"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  FaUniversalAccess,
  FaKeyboard,
  FaEye,
  FaMobile,
  FaCheck,
} from "react-icons/fa";

const AccessibilityPage = () => {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white text-gray-800 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
            Accessibility Statement
          </h1>
          <p className="text-gray-600 mb-8">Last Updated: April 15, 2025</p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            At Procog, we are committed to ensuring digital accessibility for
            people of all abilities. We are continually improving the user
            experience for everyone and applying relevant accessibility
            standards.
          </p>
        </div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-200"
        >
          <div className="prose prose-indigo max-w-none">
            <h2>Our Commitment</h2>
            <p>
              We believe that websites and digital products should be accessible
              to all people, including those with disabilities. Our goal is to
              provide a digital experience that is inclusive for everyone and
              complies with Web Content Accessibility Guidelines (WCAG) 2.1
              Level AA.
            </p>

            <h2>Conformance Status</h2>
            <p>
              The Web Content Accessibility Guidelines (WCAG) defines
              requirements for designers and developers to improve accessibility
              for people with disabilities. It defines three levels of
              conformance: Level A, Level AA, and Level AAA.
            </p>
            <p>
              Procog is committed to conforming to level AA of the Web Content
              Accessibility Guidelines 2.1. We are continuously testing our
              platform and working to address any barriers that may prevent
              access to our content by people with disabilities.
            </p>

            <h2>Accessibility Features</h2>
            <div className="grid md:grid-cols-2 gap-6 mt-6 mb-8">
              <div className="flex items-start">
                <div className="mr-4 bg-indigo-100 p-3 rounded-lg flex-shrink-0">
                  <FaKeyboard className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    Keyboard Navigation
                  </h3>
                  <p className="text-gray-600">
                    Our platform is designed to be fully navigable using a
                    keyboard, without requiring a mouse. All interactive
                    elements are properly focusable and can be activated using
                    keyboard controls.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 bg-indigo-100 p-3 rounded-lg flex-shrink-0">
                  <FaEye className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    Screen Reader Support
                  </h3>
                  <p className="text-gray-600">
                    We have implemented proper ARIA landmarks, labels, and
                    descriptions to ensure our content is accessible to users of
                    screen readers and other assistive technologies.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 bg-indigo-100 p-3 rounded-lg flex-shrink-0">
                  <FaUniversalAccess className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    Text & Visual Clarity
                  </h3>
                  <p className="text-gray-600">
                    We maintain sufficient color contrast ratios for text and
                    interactive elements, and our interfaces can be navigated at
                    various zoom levels without loss of functionality.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 bg-indigo-100 p-3 rounded-lg flex-shrink-0">
                  <FaMobile className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    Responsive Design
                  </h3>
                  <p className="text-gray-600">
                    Our platform is built with responsive design principles,
                    ensuring that users can access our services on a variety of
                    devices and screen sizes.
                  </p>
                </div>
              </div>
            </div>

            <h2>Ongoing Improvements</h2>
            <p>
              We are committed to continually improving the accessibility of our
              platform. Our development team regularly reviews our site and
              applications for accessibility issues and implements necessary
              improvements. We also use automated testing tools and conduct
              manual assessments to identify areas that need enhancement.
            </p>

            <h2>Accessibility Plan</h2>
            <p>
              As part of our commitment to accessibility, we have developed the
              following plan:
            </p>
            <ul>
              <li>Ongoing accessibility audits of our platform</li>
              <li>
                Regular staff training on digital accessibility best practices
              </li>
              <li>Addressing accessibility feedback from users promptly</li>
              <li>Testing with various assistive technologies</li>
              <li>
                Incorporating accessibility into our design and development
                processes
              </li>
            </ul>

            <h2>Feedback</h2>
            <p>
              We welcome your feedback on the accessibility of our platform. If
              you encounter any barriers to accessibility or have suggestions
              for improvement, please email us at:
              <a
                href="mailto:accessibility@procog.com"
                className="text-indigo-600 hover:text-indigo-800 ml-1"
              >
                accessibility@procog.com
              </a>
            </p>
            <p>
              We aim to respond to feedback within 2 business days and are
              committed to resolving accessibility issues in a timely manner.
            </p>

            <h2>Compatibility with Browsers and Assistive Technology</h2>
            <p>
              Procog is designed to be compatible with the following browsers
              and assistive technologies:
            </p>
            <ul>
              <li>Google Chrome (latest two versions)</li>
              <li>Mozilla Firefox (latest two versions)</li>
              <li>Apple Safari (latest two versions)</li>
              <li>Microsoft Edge (latest two versions)</li>
              <li>JAWS (latest version)</li>
              <li>NVDA (latest version)</li>
              <li>VoiceOver (latest version)</li>
              <li>TalkBack (latest version)</li>
            </ul>

            <h2>Technical Specifications</h2>
            <p>
              Procog was built using HTML, CSS, and JavaScript, with a focus on
              semantic HTML and following accessibility best practices. Our
              website uses ARIA attributes where appropriate to enhance
              accessibility for users of assistive technologies.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about our accessibility efforts or need
              assistance with any part of our platform, please contact us using
              one of the following methods:
            </p>
            <ul>
              <li>
                Email:{" "}
                <a
                  href="mailto:accessibility@procog.com"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  accessibility@procog.com
                </a>
              </li>
              <li>Phone: +1 (800) 555-0199</li>
              <li>
                Mail: Procog, Inc., 2023 Innovation Drive, Suite 500, San
                Francisco, CA 94104, United States
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Certification Section */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-indigo-50 rounded-xl p-6 inline-flex items-center"
          >
            <FaCheck className="text-indigo-600 text-2xl mr-3" />
            <p className="text-indigo-800 font-medium">
              Committed to WCAG 2.1 Level AA Standards
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPage;
