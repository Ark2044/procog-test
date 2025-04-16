"use client";
import React from "react";
import { motion } from "framer-motion";

const CookiePolicyPage = () => {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white text-gray-800 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
            Cookie Policy
          </h1>
          <p className="text-gray-600 mb-3">Last Updated: April 11, 2025</p>
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
              This Cookie Policy explains how Procog (&quot;we&quot;, &quot;us&quot;, and &quot;our&quot;)
              uses cookies and similar technologies to recognize you when you
              visit our website and use our risk management platform
              (collectively, the &quot;Service&quot;). It explains what these technologies
              are and why we use them, as well as your rights to control our use
              of them.
            </p>

            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or
              mobile device when you visit a website. Cookies are widely used by
              website owners in order to make their websites work, or to work
              more efficiently, as well as to provide reporting information.
            </p>
            <p>
              Cookies set by the website owner (in this case, Procog) are called
              &quot;first-party cookies&quot;. Cookies set by parties other than the
              website owner are called &quot;third-party cookies&quot;. Third-party
              cookies enable third-party features or functionality to be
              provided on or through the website (e.g., advertising, interactive
              content, and analytics). The parties that set these third-party
              cookies can recognize your computer both when it visits the
              website in question and also when it visits certain other
              websites.
            </p>

            <h2>2. Why Do We Use Cookies?</h2>
            <p>
              We use first-party and third-party cookies for several reasons.
              Some cookies are required for technical reasons in order for our
              Service to operate, and we refer to these as &quot;essential&quot; or
              &quot;strictly necessary&quot; cookies. Other cookies also enable us to
              track and target the interests of our users to enhance the
              experience on our Service. Third parties serve cookies through our
              Service for advertising, analytics, and other purposes. This is
              described in more detail below.
            </p>

            <h2>3. Types of Cookies We Use</h2>
            <p>
              The specific types of first and third-party cookies served through
              our Service and the purposes they perform include:
            </p>

            <h3>Essential Cookies</h3>
            <p>
              These cookies are strictly necessary to provide you with services
              available through our Service and to use some of its features,
              such as access to secure areas. Because these cookies are strictly
              necessary to deliver the Service, you cannot refuse them without
              impacting how our Service functions.
            </p>
            <ul>
              <li>
                <strong>Session Cookies:</strong> These cookies are temporary
                and expire once you close your browser.
              </li>
              <li>
                <strong>Authentication Cookies:</strong> These cookies help us
                identify you when you are logged in to our platform.
              </li>
              <li>
                <strong>Security Cookies:</strong> These cookies help us detect
                security risks and protect our users.
              </li>
            </ul>

            <h3>Performance and Functionality Cookies</h3>
            <p>
              These cookies are used to enhance the performance and
              functionality of our Service but are non-essential to their use.
              However, without these cookies, certain functionality may become
              unavailable.
            </p>
            <ul>
              <li>
                <strong>Preference Cookies:</strong> These cookies remember your
                settings and preferences.
              </li>
              <li>
                <strong>Feature Cookies:</strong> These cookies provide enhanced
                functionality and personalization.
              </li>
            </ul>

            <h3>Analytics and Customization Cookies</h3>
            <p>
              These cookies collect information that is used either in aggregate
              form to help us understand how our Service is being used or how
              effective our marketing campaigns are, or to help us customize our
              Service for you.
            </p>
            <ul>
              <li>
                <strong>Google Analytics:</strong> We use Google Analytics
                cookies to analyze how users use our Service and to monitor the
                performance of our site.
              </li>
              <li>
                <strong>Hotjar:</strong> We use Hotjar cookies to better
                understand our users&apos; needs and to optimize our Service.
              </li>
            </ul>

            <h3>Marketing Cookies</h3>
            <p>
              These cookies are used to make advertising messages more relevant
              to you. They perform functions like preventing the same ad from
              continuously reappearing, ensuring that ads are properly
              displayed, and in some cases selecting advertisements that are
              based on your interests.
            </p>
            <ul>
              <li>
                <strong>LinkedIn Cookies:</strong> For targeting professional
                audiences.
              </li>
              <li>
                <strong>Facebook Cookies:</strong> For social media marketing
                campaigns.
              </li>
            </ul>

            <h2>4. How Can You Control Cookies?</h2>
            <p>
              You have the right to decide whether to accept or reject cookies.
              You can exercise your cookie preferences through our cookie
              consent banner when you first visit our website.
            </p>
            <p>
              You can also set or amend your web browser controls to accept or
              refuse cookies. If you choose to reject cookies, you may still use
              our Service though your access to some functionality and areas of
              our Service may be restricted. As the means by which you can
              refuse cookies through your web browser controls vary from browser
              to browser, you should visit your browser&apos;s help menu for more
              information.
            </p>
            <p>
              In addition, most advertising networks offer you a way to opt out
              of targeted advertising. If you would like to find out more
              information, please visit{" "}
              <a
                href="http://www.aboutads.info/choices/"
                className="text-indigo-600 hover:text-indigo-800"
              >
                http://www.aboutads.info/choices/
              </a>{" "}
              or
              <a
                href="http://www.youronlinechoices.com"
                className="text-indigo-600 hover:text-indigo-800"
              >
                {" "}
                http://www.youronlinechoices.com
              </a>
              .
            </p>

            <h2>5. How Often Will We Update This Cookie Policy?</h2>
            <p>
              We may update this Cookie Policy from time to time in order to
              reflect, for example, changes to the cookies we use or for other
              operational, legal, or regulatory reasons. Please therefore
              revisit this Cookie Policy regularly to stay informed about our
              use of cookies and related technologies.
            </p>
            <p>
              The date at the top of this Cookie Policy indicates when it was
              last updated.
            </p>

            <h2>6. Do Not Track Signals</h2>
            <p>
              Some browsers may be configured to send &quot;Do Not Track&quot; signals to
              websites you visit. We currently do not respond to &quot;Do Not Track&quot;
              or similar signals. To find out more about &quot;Do Not Track,&quot; please
              visit
              <a
                href="http://www.allaboutdnt.com"
                className="text-indigo-600 hover:text-indigo-800"
              >
                {" "}
                http://www.allaboutdnt.com
              </a>
              .
            </p>

            <h2>7. Cookies Subject to Change</h2>
            <p>
              The content of this policy is for your general information and use
              only. These cookies are subject to change without notice. You are
              encouraged to check this page for any updates to our Cookie
              Policy.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or other
              technologies, please email us at privacy@procog.com.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
