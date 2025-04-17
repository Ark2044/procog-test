"use client";
import React from "react";
import { motion } from "framer-motion";

const PrivacyPage = () => {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white text-gray-800 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-3">Last Updated: April 12, 2025</p>
        </div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 border border-gray-200"
        >
          <div className="prose prose-indigo max-w-none">
            <p>
              At Procog, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our risk management platform, website,
              and related services (collectively, the &quot;Service&quot;). Please read
              this privacy policy carefully. If you do not agree with the terms
              of this privacy policy, please do not access the Service.
            </p>

            <h2>1. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>
              We may collect personal information that you voluntarily provide
              to us when you register for the Service, express interest in
              obtaining information about us or our products, or otherwise
              contact us. The personal information we collect may include:
            </p>
            <ul>
              <li>Name, email address, and contact details</li>
              <li>Job title and organization information</li>
              <li>User credentials (username and password)</li>
              <li>Profile information</li>
              <li>Payment information</li>
              <li>Communications and correspondence with us</li>
            </ul>

            <h3>Usage Data</h3>
            <p>
              We automatically collect certain information about your device and
              how you interact with our Service. This information may include:
            </p>
            <ul>
              <li>IP address and device identifiers</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and features used</li>
              <li>Access times and dates</li>
              <li>Referring website addresses</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect for various business purposes,
              including:
            </p>
            <ul>
              <li>Providing, maintaining, and improving the Service</li>
              <li>Processing transactions and managing your account</li>
              <li>
                Responding to your inquiries and providing customer support
              </li>
              <li>
                Sending administrative information, updates, and security alerts
              </li>
              <li>
                Sending marketing and promotional communications (with your
                consent where required by law)
              </li>
              <li>Personalizing your experience</li>
              <li>Analyzing usage patterns to improve the Service</li>
              <li>Protecting against unauthorized access and fraud</li>
              <li>Complying with legal obligations</li>
            </ul>

            <h2>3. How We Share Your Information</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul>
              <li>
                <strong>With Service Providers:</strong> We may share your
                information with third-party vendors, service providers,
                contractors, or agents who perform services for us or on our
                behalf.
              </li>
              <li>
                <strong>For Business Transfers:</strong> If we are involved in a
                merger, acquisition, or sale of all or a portion of our assets,
                your information may be transferred as part of that transaction.
              </li>
              <li>
                <strong>With Your Consent:</strong> We may disclose your
                information for any other purpose with your consent.
              </li>
              <li>
                <strong>To Comply with Laws:</strong> We may disclose your
                information where required to do so by law or in response to
                valid requests by public authorities.
              </li>
              <li>
                <strong>To Protect Rights:</strong> We may disclose your
                information to protect and defend our rights and property, or
                the safety of our users or others.
              </li>
            </ul>

            <h2>4. Data Retention</h2>
            <p>
              We will retain your personal information only for as long as is
              necessary for the purposes set out in this Privacy Policy. We will
              retain and use your information to the extent necessary to comply
              with our legal obligations, resolve disputes, and enforce our
              policies.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational
              security measures designed to protect the security of any personal
              information we process. However, despite our safeguards and
              efforts to secure your information, no electronic transmission
              over the Internet or information storage technology can be
              guaranteed to be 100% secure.
            </p>

            <h2>6. Your Data Protection Rights</h2>
            <p>
              Depending on your location, you may have the following data
              protection rights:
            </p>
            <ul>
              <li>
                The right to access, update, or delete your personal information
              </li>
              <li>The right to data portability</li>
              <li>The right to restrict processing</li>
              <li>The right to object to processing</li>
              <li>The right to be informed</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the contact
              information provided below.
            </p>

            <h2>7. GDPR Compliance</h2>
            <p>
              If you are a resident of the European Economic Area (EEA), you
              have certain data protection rights under the General Data
              Protection Regulation (GDPR). We aim to take reasonable steps to
              allow you to correct, amend, delete, or limit the use of your
              personal information.
            </p>
            <p>
              The data controller of your personal information is Procog, Inc.
              Our legal basis for collecting and using your personal information
              depends on the specific information concerned and the context in
              which we collect it.
            </p>

            <h2>8. CCPA Compliance</h2>
            <p>
              If you are a resident of California, you have certain rights under
              the California Consumer Privacy Act (CCPA). You have the right to
              request that we disclose what personal information we collect,
              use, disclose, and sell. You also have the right to request
              deletion of your personal information, and the right not to be
              discriminated against for exercising your rights.
            </p>
            <p>
              To exercise these rights, please contact us using the contact
              information provided below.
            </p>

            <h2>9. International Data Transfers</h2>
            <p>
              Our servers are located in the United States. If you are accessing
              our Service from outside the United States, please be aware that
              your information may be transferred to, stored, and processed by
              us in our facilities and by our service providers in countries
              where your data may not be subject to the same protections as in
              your jurisdiction.
            </p>
            <p>
              By using our Service, you consent to the transfer of your
              information to the United States and the processing of your
              information in the United States.
            </p>

            <h2>10. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity
              on our Service and store certain information. For more information
              about our use of cookies, please see our Cookie Policy.
            </p>

            <h2>11. Children&apos;s Privacy</h2>
            <p>
              Our Service is not directed to individuals under the age of 16. We
              do not knowingly collect personal information from children under
              16. If we learn that we have collected personal information from a
              child under 16, we will take steps to delete that information as
              quickly as possible.
            </p>

            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the &quot;Last Updated&quot; date at the top of this page. You
              are advised to review this Privacy Policy periodically for any
              changes.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or
              our privacy practices, please contact us at:
            </p>
            <p>
              Email: privacy@procog.com
              <br />
              Address: Procog, Inc., 2023 Innovation Drive, Suite 500, San
              Francisco, CA 94104, United States
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;
