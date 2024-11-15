import { FC } from "react";
import { LucideIcon } from "lucide-react";

interface BenefitProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const BenefitCard: FC<BenefitProps> = ({ icon: Icon, title, description }) => (
  <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-y-12">
    <div className="mb-6">
      <Icon className="w-8 h-8 text-blue-400" />
    </div>
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

export default BenefitCard;
