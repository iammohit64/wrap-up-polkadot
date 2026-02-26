import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import axios from "axios";
import { 
  Brain, Sparkles, Search, BarChart3, 
  Globe, Zap, Shield, Link2, Scale
} from "lucide-react";

const API_BASE = '/api';

export default function ResearchLandingPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("idle"); 
  const navigate = useNavigate();

  const handleResearch = async (e) => {
    e.preventDefault();
    
    if (!topic.trim() || topic.trim().length < 5) {
      toast.error("Please enter a topic (at least 5 characters)");
      return;
    }

    setLoading(true);
    setStage("searching");
    
    const loadingToast = toast.loading("Initializing AI research engine...");

    try {
      // Simulate searching phase
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Phase 1: Generate research report
      setStage("analyzing");
      toast.loading("Analyzing multiple sources...", { id: loadingToast });
      
      const response = await axios.post(`${API_BASE}/research/generate`, {
        topic: topic.trim()
      });

      setStage("complete");
      toast.success("Research complete!", { id: loadingToast });

      // Navigate to research report page
      setTimeout(() => {
        navigate(`/research/${response.data.researchId}`);
      }, 500);

    } catch (error) {
      console.error("Research error:", error);
      toast.error(
        error.response?.data?.error || "Research failed. Please try again.",
        { id: loadingToast }
      );
      setStage("idle");
    } finally {
      setLoading(false);
    }
  };

  const getStageMessage = () => {
    switch (stage) {
      case "searching":
        return "🔍 Searching across 10+ platforms...";
      case "analyzing":
        return "🧠 Analyzing sources and synthesizing insights...";
      case "complete":
        return "✅ Research complete! Redirecting...";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-[#10b981] selection:text-black flex flex-col relative overflow-hidden">
      
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23ffffff' fill='none'/%3E%3C/svg%3E")` 
        }}
      />

      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10 flex-grow flex flex-col justify-center">
        
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/30 px-4 py-1.5 rounded-full mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#10b981]">Deep Engine v2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Multi-Source <span className="text-[#10b981]">Research.</span>
          </h1>
          <p className="text-zinc-500 text-xl max-w-2xl mx-auto leading-relaxed">
            Get comprehensive, AI-synthesized research reports from 10+ authoritative sources. 
            Identify consensus, contradictions, and insights in seconds.
          </p>
        </div>
        {/* --- ADD THESE LINES HERE --- */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <w3m-button />
          <w3m-network-button />
        </div>
        {/* Main Input Section */}
        <div className="w-full max-w-3xl mx-auto mb-16">
          <form 
            onSubmit={handleResearch} 
            className="bg-[#121214] border border-[#27272a] p-2 rounded-2xl flex flex-col sm:flex-row gap-3 shadow-2xl shadow-black/50 transition-all hover:border-zinc-500 focus-within:border-[#10b981]"
          >
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your research topic... (e.g., 'Impact of AI on healthcare')"
              className="flex-1 bg-transparent px-6 py-4 text-white placeholder-zinc-600 focus:outline-none text-lg w-full"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || topic.trim().length < 5}
              className="bg-[#10b981] hover:bg-[#059669] text-black px-8 py-4 rounded-xl font-bold uppercase tracking-wide text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-black rounded-full border-t-transparent"></div>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </form>

          {/* Loading Indicator */}
          {loading && (
            <div className="mt-6 flex justify-center animate-fade-in">
              <div className="inline-flex items-center gap-3 bg-[#18181b] border border-[#27272a] px-6 py-3 rounded-full">
                <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">{getStageMessage()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Legacy Links */}
        <div className="flex justify-center gap-6 mb-24">
            <button 
              onClick={() => navigate("/compare")}
              className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-[#10b981] transition-colors flex items-center gap-2 group"
            >
              <Scale className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Comparator
            </button>
            <button 
              onClick={() => navigate("/legacy")}
              className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2 group"
            >
              <Link2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Legacy Mode
            </button>
        </div>

        {/* Features / Steps Grid */}
        <div className="w-full pt-20 pb-24 border-t border-[#27272a]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-7xl mx-auto">
            {[
              { 
                icon: Globe, 
                title: "10+ Sources", 
                desc: "Web, Twitter, Reddit, News, & Papers.",
                color: "group-hover:text-blue-400"
              },
              { 
                icon: Zap, 
                title: "Extraction", 
                desc: "Clean content filtering & noise removal.",
                color: "group-hover:text-yellow-400"
              },
              { 
                icon: Brain, 
                title: "Analysis", 
                desc: "Deep AI synthesis & consensus mapping.",
                color: "group-hover:text-[#10b981]"
              },
              { 
                icon: BarChart3, 
                title: "Visuals", 
                desc: "Sentiment analysis & credibility scoring.",
                color: "group-hover:text-purple-400"
              }
            ].map((step, idx) => (
              <div key={idx} className="group p-8 rounded-2xl border border-[#27272a] bg-[#121214]/50 hover:bg-[#121214] hover:border-[#10b981] transition-all duration-300 cursor-default">
                <div className="w-12 h-12 bg-[#18181b] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-[#27272a]">
                  <step.icon className={`w-6 h-6 text-white transition-colors ${step.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-base text-zinc-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Credibility Section */}
        <div className="w-full max-w-3xl mx-auto mb-16">
          <div className="group relative overflow-hidden bg-[#121214] border border-[#27272a] p-8 rounded-2xl text-center hover:border-[#10b981]/50 transition-all duration-500">
             {/* Subtle Glow */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-[#10b981]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
             
             <div className="relative z-10 flex flex-col items-center">
               <div className="w-16 h-16 bg-[#18181b] border border-[#27272a] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#10b981] transition-all duration-300">
                 <Shield className="w-8 h-8 text-[#10b981]" />
               </div>
               
               <h3 className="text-2xl font-bold text-white mb-4">
                 Credibility & <span className="text-[#10b981]">Transparency</span>
               </h3>
               
               <p className="text-zinc-500 text-lg leading-relaxed max-w-xl mx-auto">
                 All sources are cited with full URLs. Reports include credibility disclaimers 
                 and evidence quality assessments. No content is plagiarized—everything is synthesized.
               </p>
             </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}