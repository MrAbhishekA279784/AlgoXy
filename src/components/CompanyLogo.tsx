import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  company: string;
  logo?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function CompanyLogo({ company, logo, className, size = "md" }: CompanyLogoProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(logo || null);
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  useEffect(() => {
    if (logo) {
      setImgSrc(logo);
      setError(false);
    } else {
      // Try to generate Clearbit URL from company name
      const domain = company.toLowerCase().replace(/\s+/g, "") + ".com";
      setImgSrc(`https://logo.clearbit.com/${domain}`);
      setError(false);
    }
  }, [logo, company]);

  const handleError = () => {
    if (imgSrc && imgSrc.includes("clearbit.com")) {
      // If clearbit fails, show placeholder
      setError(true);
    } else {
      // If initial logo fails, try clearbit
      const domain = company.toLowerCase().replace(/\s+/g, "") + ".com";
      setImgSrc(`https://logo.clearbit.com/${domain}`);
    }
  };

  return (
    <div className={cn(
      "bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800",
      sizeClasses[size],
      className
    )}>
      {!error && imgSrc ? (
        <img
          src={imgSrc}
          alt={company}
          className="w-full h-full object-contain p-1.5"
          onError={handleError}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <Building2 className={cn("text-slate-400 dark:text-slate-600", iconSizes[size])} />
      )}
    </div>
  );
}
