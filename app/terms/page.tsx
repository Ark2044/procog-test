"use client";
import React from "react";
import { motion } from "framer-motion";

const TermsPage = () => {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white text-gray-800 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-3">Last Updated: April 10, 2025</p>
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
              Welcome to Procog. These Terms of Service (&quot;Terms&quot;) govern your
              access to and use of the Procog platform, including any associated
              mobile applications, websites, software, and services
              (collectively, the &quot;Service&quot;). Please read these Terms carefully
              before using the Service.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Service, you agree to be bound by these
              Terms and our Privacy Policy. If you are using the Service on
              behalf of an organization, you are agreeing to these Terms for
              that organization and confirming that you have the authority to
              bind that organization to these Terms.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Procog provides a risk management platform designed to help
              organizations identify, assess, and mitigate risks. The Service
              includes tools for risk analysis, collaboration, reporting, and
              other related functionalities.
            </p>

            <h2>3. Account Registration and Security</h2>
            <p>
              To access certain features of the Service, you may need to
              register for an account. You agree to provide accurate, current,
              and complete information during the registration process and to
              update such information to keep it accurate, current, and
              complete.
            </p>
            <p>
              You are responsible for safeguarding your password and for all
              activities that occur under your account. You agree to notify us
              immediately of any unauthorized use of your account or any other
              breach of security.
            </p>

            <h2>4. Subscription and Payments</h2>
            <p>
              Certain aspects of the Service may require a paid subscription.
              Payment terms will be as set forth on the applicable order form or
              subscription page. Unless otherwise specified, subscriptions will
              automatically renew for the same term and at the then-current
              rates unless you provide notice of non-renewal.
            </p>
            <p>
              All payments are non-refundable except as expressly set forth in
              these Terms or as required by applicable law.
            </p>

            <h2>5. Intellectual Property Rights</h2>
            <p>
              The Service and its original content, features, and functionality
              are owned by Procog and are protected by international copyright,
              trademark, patent, trade secret, and other intellectual property
              or proprietary rights laws.
            </p>
            <p>
              You retain all rights to any content you submit, post, or display
              on or through the Service. By submitting, posting, or displaying
              content on or through the Service, you grant us a worldwide,
              non-exclusive, royalty-free license to use, reproduce, modify,
              adapt, publish, translate, and distribute such content in
              connection with providing and improving the Service.
            </p>

            <h2>6. Data Privacy and Security</h2>
            <p>
              Our collection and use of personal information in connection with
              the Service is as described in our Privacy Policy. You agree that
              we may use your data as described in our Privacy Policy.
            </p>
            <p>
              We implement reasonable technical, administrative, and physical
              safeguards designed to protect your data. However, no security
              system is impenetrable, and we cannot guarantee the security of
              our systems or your data.
            </p>

            <h2>7. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>
                Use the Service in any way that violates any applicable law or
                regulation
              </li>
              <li>
                Use the Service to transmit any material that is defamatory,
                offensive, or otherwise objectionable
              </li>
              <li>
                Attempt to interfere with, compromise the system integrity or
                security, or decipher any transmissions to or from the servers
                running the Service
              </li>
              <li>
                Use any robot, spider, crawler, scraper, or other automated
                means to access the Service
              </li>
              <li>
                Impersonate another person or otherwise misrepresent your
                affiliation with a person or entity
              </li>
              <li>
                Upload invalid data, viruses, worms, or other malicious software
              </li>
            </ul>

            <h2>8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL PROCOG
              BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS,
              DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM
              YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE
              SERVICE.
            </p>

            <h2>9. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Procog, its
              officers, directors, employees, and agents, from and against any
              claims, liabilities, damages, losses, and expenses, including,
              without limitation, reasonable legal and accounting fees, arising
              out of or in any way connected with your access to or use of the
              Service or your violation of these Terms.
            </p>

            <h2>10. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service
              immediately, without prior notice or liability, for any reason
              whatsoever, including without limitation if you breach these
              Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately
              cease. All provisions of these Terms which by their nature should
              survive termination shall survive termination, including, without
              limitation, ownership provisions, warranty disclaimers, indemnity,
              and limitations of liability.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. We will provide notice of any significant
              changes by posting the updated Terms on this page with a new
              effective date.
            </p>
            <p>
              Your continued use of the Service after any such changes
              constitutes your acceptance of the new Terms.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of California, without regard to its
              conflict of law provisions.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at
              legal@procog.com.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;
