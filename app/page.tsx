"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/Auth";
import FeatureCard from "@/components/layout/FeatureCard";
import BenefitCard from "@/components/layout/BenefitCard";
import HeroSection from "@/components/layout/HeroSection";
import { BarChart3, Shield, Settings, CheckCircle, Briefcase, Clipboard } from "lucide-react";

const HomePage = () => {
  const router = useRouter();
  const { session, verifySession, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await verifySession();
      } catch (err) {
        console.error(err);
        setError("Failed to verify session. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [verifySession]);

  useEffect(() => {
    if (session && user) {
      router.push(`/dashboard/${user.$id}`);
    }
  }, [session, user, router]);

  const features = useMemo(() => [
    { icon: BarChart3, title: "Advanced Analytics", description: "Gain valuable insights.", color: "from-blue-400 to-indigo-600" },
    { icon: Shield, title: "Risk Mitigation", description: "Identify and mitigate risks.", color: "from-emerald-400 to-teal-600" },
    { icon: Settings, title: "Customizable Settings", description: "Tailor the platform.", color: "from-purple-400 to-pink-600" },
  ], []);

  const benefits = useMemo(() => [
    { icon: CheckCircle, title: "Streamlined Compliance", description: "Ensure compliance." },
    { icon: Briefcase, title: "Improved Decision-Making", description: "Make informed decisions." },
    { icon: Clipboard, title: "Centralized Risk Management", description: "Consolidate information." },
  ], []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="loader"></div>
        <style jsx>{`
          .loader {
            border: 8px solid rgba(255, 255, 255, 0.1);
            border-left-color: #ffffff;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <HeroSection />
      <div className="py-32">
        <h2 className="text-4xl font-bold text-center mb-16">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
      <div className="py-32">
        <h2 className="text-4xl font-bold text-center mb-16">Key Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;