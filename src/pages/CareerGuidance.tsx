import { useState, useEffect } from "react";
import { Sparkles, Target, BookOpen, Briefcase, Award, TrendingUp, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCareerGuidance } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function CareerGuidance() {
  const [guidance, setGuidance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      const data = await getCareerGuidance(uid);
      setGuidance(data);
    } catch {
      toast.error("Failed to load career guidance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Analyzing your profile...</p>
        </div>
      </div>
    );
  }

  if (!guidance) return null;

  const readiness = guidance.readinessScore ?? 0;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Career Guidance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Personalized roadmap based on your profile</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Top Role + Readiness */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-5 h-5 opacity-80" />
            <span className="text-sm font-semibold opacity-80">Best Match Role</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">{guidance.topRole || "Software Engineer"}</h2>
          <p className="text-sm opacity-75">Based on your skills and academic profile</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Readiness Score</span>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">{readiness}%</span>
            <span className="text-sm text-slate-500 mb-1">ready for {guidance.topRole}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", readiness >= 75 ? "bg-green-500" : readiness >= 50 ? "bg-yellow-500" : "bg-red-500")}
              style={{ width: `${readiness}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { icon: Sparkles, label: "Skill Suggestion", value: guidance.skillSuggestion, color: "blue" },
          { icon: Target, label: "Interview Prep", value: guidance.interviewPrep, color: "purple" },
          { icon: TrendingUp, label: "Placement Advice", value: guidance.placementAdvice, color: "green" },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center",
                item.color === "blue" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" :
                item.color === "purple" ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600" :
                "bg-green-50 dark:bg-green-900/20 text-green-600")}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{item.label}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Roadmap */}
      {guidance.roadmap?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Roadmap to {guidance.topRole}</h2>
          </div>
          <div className="space-y-3">
            {guidance.roadmap.map((step: string, i: number) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top companies + Certifications */}
      <div className="grid md:grid-cols-2 gap-6">
        {guidance.topCompanies?.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" /> Top Companies to Target
            </h3>
            <div className="flex flex-wrap gap-2">
              {guidance.topCompanies.map((c: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        {guidance.certifications?.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" /> Recommended Certifications
            </h3>
            <div className="space-y-2">
              {guidance.certifications.map((cert: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
