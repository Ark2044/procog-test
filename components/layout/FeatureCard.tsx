import { FC } from "react";
import { LucideIcon } from "lucide-react";

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const FeatureCard: FC<FeatureProps> = ({
  icon: Icon,
  title,
  description,
  color,
}) => (
  <div className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden transition-all duration-300 hover:scale-105">
    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    <div
      className={`inline-block p-3 rounded-xl bg-gradient-to-r ${color} mb-6`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

export default FeatureCard;
