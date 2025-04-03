"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  AlertTriangle,
  Clock,
  BarChart,
  Users,
  Shield,
  Settings,
  FileText,
  ChevronLeft,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const UserGuidePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("getting-started");

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="container mx-auto py-8 px-4 max-w-6xl"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <motion.div variants={fadeInUp}>
          <Button
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-1" size={16} />
            Back
          </Button>
        </motion.div>
        <motion.div variants={fadeInUp} className="flex items-center">
          <HelpCircle className="mr-2 text-indigo-600" size={24} />
          <h1 className="text-3xl font-bold text-gray-800">User Guide</h1>
        </motion.div>
        <div className="w-20"></div> {/* Spacer for balance */}
      </div>

      <motion.div variants={fadeInUp} className="mb-8">
        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
          Welcome to the Risk Management System! This guide will help you
          navigate through our platform and make the most of its features.
        </p>
      </motion.div>

      <Tabs
        defaultValue="getting-started"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <motion.div variants={fadeInUp}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-8 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="getting-started" className="rounded-md">
              <BookOpen className="mr-2 h-4 w-4" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="rounded-md">
              <BarChart className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="risk-management" className="rounded-md">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Risk Management
            </TabsTrigger>
            <TabsTrigger value="advanced" className="rounded-md">
              <Settings className="mr-2 h-4 w-4" />
              Advanced Features
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value="getting-started">
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to Risk Management System</CardTitle>
                  <CardDescription>
                    Learn the basics to get started with our platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <Users className="mr-2 text-indigo-600" size={20} />
                        User Roles
                      </h3>
                      <p className="text-gray-600">
                        Our platform supports different roles including regular
                        users, department heads, and administrators, each with
                        specific permissions and access levels.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <Shield className="mr-2 text-indigo-600" size={20} />
                        Your First Login
                      </h3>
                      <p className="text-gray-600">
                        After registration, you&apos;ll be directed to your
                        dashboard. Complete your profile and set your department
                        to ensure you see relevant risks.
                      </p>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="mt-6">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Navigation Overview</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-5 space-y-2">
                          <li>
                            <strong>Header:</strong> Contains navigation links
                            to Dashboard, Risks, Reminders, and Profile.
                          </li>
                          <li>
                            <strong>Dashboard:</strong> Your main control center
                            with risk overview and statistics.
                          </li>
                          <li>
                            <strong>Risk Management:</strong> Where you can
                            create, view, and manage individual risks.
                          </li>
                          <li>
                            <strong>Profile:</strong> Manage your account
                            settings and preferences.
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>First Steps</AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>
                            Complete your profile with relevant department
                            information
                          </li>
                          <li>
                            Explore the dashboard to understand the statistics
                            and overview
                          </li>
                          <li>
                            Create your first risk entry to get familiar with
                            the process
                          </li>
                          <li>
                            Check your department&apos;s existing risks to
                            understand your team&apos;s risk landscape
                          </li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="dashboard">
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Understanding Your Dashboard</CardTitle>
                  <CardDescription>
                    Navigate and interpret your risk management dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <BarChart className="mr-2 text-indigo-600" size={20} />
                        Dashboard Overview
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your dashboard is the central hub for monitoring risks,
                        with statistics cards showing impact and action
                        distributions.
                      </p>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-3 border rounded-lg bg-blue-50 border-blue-100">
                          <h4 className="font-medium text-blue-700">
                            Impact Statistics
                          </h4>
                          <p className="text-sm text-gray-600">
                            Shows distribution of risks by their impact level
                            (low, medium, high)
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg bg-purple-50 border-purple-100">
                          <h4 className="font-medium text-purple-700">
                            Action Statistics
                          </h4>
                          <p className="text-sm text-gray-600">
                            Displays risks by action type (mitigate, accept,
                            transfer, avoid)
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg bg-amber-50 border-amber-100">
                          <h4 className="font-medium text-amber-700">
                            Risk List
                          </h4>
                          <p className="text-sm text-gray-600">
                            Lists all risks relevant to your department with key
                            details
                          </p>
                        </div>
                      </div>
                    </div>

                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Creating a New Risk</AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">
                            To create a new risk from your dashboard:
                          </p>
                          <ol className="list-decimal pl-5 space-y-2">
                            <li>Click the &quot;Create Risk&quot; button</li>
                            <li>
                              Fill in the risk details form with title, content,
                              impact level, and probability
                            </li>
                            <li>
                              Select the appropriate action (mitigate, accept,
                              transfer, avoid)
                            </li>
                            <li>
                              Choose the department responsible for the risk
                            </li>
                            <li>
                              Add any mitigation strategies in the relevant
                              field
                            </li>
                            <li>
                              Mark as confidential if the risk contains
                              sensitive information
                            </li>
                            <li>Submit the form to create the risk</li>
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Filtering Risks</AccordionTrigger>
                        <AccordionContent>
                          <p>
                            You can filter risks on your dashboard by various
                            criteria:
                          </p>
                          <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>
                              By department (if you have access to multiple)
                            </li>
                            <li>By impact level (low, medium, high)</li>
                            <li>
                              By action type (mitigate, accept, transfer, avoid)
                            </li>
                            <li>By status (pending, in progress, completed)</li>
                            <li>By creating user</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="risk-management">
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Risk Management Process</CardTitle>
                  <CardDescription>
                    Learn how to effectively manage individual risks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <AlertTriangle
                          className="mr-2 text-orange-600"
                          size={20}
                        />
                        Risk Lifecycle
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Each risk goes through a lifecycle from identification
                        to resolution or acceptance.
                      </p>

                      <div className="relative">
                        <div className="absolute left-4 h-full w-0.5 bg-gray-200"></div>
                        <div className="space-y-8 relative">
                          <div className="flex">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium z-10">
                              1
                            </div>
                            <div className="ml-6">
                              <h4 className="font-medium text-gray-800">
                                Risk Identification
                              </h4>
                              <p className="text-gray-600">
                                Creating a new risk entry with detailed
                                information about the potential threat.
                              </p>
                            </div>
                          </div>

                          <div className="flex">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium z-10">
                              2
                            </div>
                            <div className="ml-6">
                              <h4 className="font-medium text-gray-800">
                                Risk Assessment
                              </h4>
                              <p className="text-gray-600">
                                Evaluating the impact and probability of the
                                risk to determine its severity.
                              </p>
                            </div>
                          </div>

                          <div className="flex">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium z-10">
                              3
                            </div>
                            <div className="ml-6">
                              <h4 className="font-medium text-gray-800">
                                Mitigation Planning
                              </h4>
                              <p className="text-gray-600">
                                Developing strategies to address and reduce the
                                risk.
                              </p>
                            </div>
                          </div>

                          <div className="flex">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium z-10">
                              4
                            </div>
                            <div className="ml-6">
                              <h4 className="font-medium text-gray-800">
                                Implementation
                              </h4>
                              <p className="text-gray-600">
                                Executing the mitigation strategies and tracking
                                progress.
                              </p>
                            </div>
                          </div>

                          <div className="flex">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium z-10">
                              5
                            </div>
                            <div className="ml-6">
                              <h4 className="font-medium text-gray-800">
                                Monitoring & Review
                              </h4>
                              <p className="text-gray-600">
                                Continuous monitoring and periodic review of
                                risk status.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="mt-8">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          Understanding Risk Details
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">
                            When viewing a risk, you&apos;ll see these key
                            components:
                          </p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>
                              <strong>Risk Title & Description:</strong> The
                              main identifier and details of the risk
                            </li>
                            <li>
                              <strong>Impact & Probability:</strong> Indicators
                              of severity and likelihood
                            </li>
                            <li>
                              <strong>Action Type:</strong> How the organization
                              is addressing the risk
                            </li>
                            <li>
                              <strong>Department:</strong> The team responsible
                              for managing the risk
                            </li>
                            <li>
                              <strong>Mitigation Plan:</strong> Strategies to
                              reduce the risk
                            </li>
                            <li>
                              <strong>Status:</strong> Current state in the risk
                              lifecycle
                            </li>
                            <li>
                              <strong>Comments:</strong> Discussion thread about
                              the risk
                            </li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>
                          Updating Risk Status
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">
                            To update the status of a risk:
                          </p>
                          <ol className="list-decimal pl-5 space-y-2">
                            <li>Navigate to the risk details page</li>
                            <li>
                              Find the status dropdown in the top section of the
                              risk view
                            </li>
                            <li>
                              Select the appropriate status (Pending, In
                              Progress, Completed, Archived)
                            </li>
                            <li>
                              Add a comment explaining the status change if
                              necessary
                            </li>
                            <li>Save the changes</li>
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="advanced">
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Features</CardTitle>
                  <CardDescription>
                    Discover powerful tools for experienced users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <FileText className="mr-2 text-indigo-600" size={20} />
                        Reporting & Analytics
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Generate comprehensive reports and analytics to gain
                        deeper insights into your risk landscape.
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <h4 className="font-medium text-gray-800 mb-2">
                            Custom Reports
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Create tailored reports by filtering risks based on
                            multiple criteria such as department, impact level,
                            status, and date ranges.
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <h4 className="font-medium text-gray-800 mb-2">
                            Trend Analysis
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Track how risks evolve over time with our trend
                            analysis tools, helping you identify patterns and
                            predict future risks.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <Clock className="mr-2 text-indigo-600" size={20} />
                        Reminders & Notifications
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Set up customized reminders and notifications to ensure
                        timely risk management.
                      </p>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                          <AccordionTrigger>
                            Setting Up Reminders
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="mb-2">
                              To set up reminders for risk reviews:
                            </p>
                            <ol className="list-decimal pl-5 space-y-1">
                              <li>Navigate to the Reminders section</li>
                              <li>Click &quot;Create Reminder&quot;</li>
                              <li>
                                Select the risk to be reviewed or choose
                                &quot;All Risks&quot;
                              </li>
                              <li>
                                Set the frequency (one-time, weekly, monthly,
                                quarterly)
                              </li>
                              <li>
                                Choose notification methods (email, in-app)
                              </li>
                              <li>Save your reminder settings</li>
                            </ol>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>
                            Managing Notifications
                          </AccordionTrigger>
                          <AccordionContent>
                            <p>
                              Customize your notification preferences in your
                              profile settings:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                              <li>Risk updates and status changes</li>
                              <li>New risks created in your department</li>
                              <li>Comment notifications</li>
                              <li>Reminder alerts</li>
                              <li>System announcements</li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <Users className="mr-2 text-indigo-600" size={20} />
                        Collaboration Features
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Work effectively with team members on risk management
                        tasks.
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <h4 className="font-medium text-gray-800 mb-2">
                            Comment Threads
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Discuss risks with team members through threaded
                            comments, keeping all conversations organized and
                            contextual.
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <h4 className="font-medium text-gray-800 mb-2">
                            Risk Assignments
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Assign specific team members to risks, defining
                            clear ownership and responsibility for mitigation
                            actions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default UserGuidePage;
