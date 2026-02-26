import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { Brain, Calendar, User, ThumbsUp, MessageSquare, Hexagon, TrendingUp } from "lucide-react";

const API_BASE = '/api';

export default function AllResearchPage() {
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResearch();
  }, [page]);

  const fetchResearch = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/research?page=${page}&limit=12`);
      setResearch(response.data.research);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load research:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#10b981] rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading research reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-[#10b981]" />
            <h1 className="text-4xl font-bold">Research Reports</h1>
          </div>
          <p className="text-zinc-400 text-lg">
            Explore comprehensive AI-generated research reports across multiple topics
          </p>
        </div>

        {research.length === 0 ? (
          <div className="text-center py-20">
            <Brain className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-lg">No research reports yet. Be the first to create one!</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-[#10b981] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#059669]"
            >
              Create Research Report
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {research.map((report) => (
                <div
                  key={report.id}
                  onClick={() => navigate(`/research/${report.id}`)}
                  className="bg-[#121214] border border-[#27272a] rounded-xl p-6 hover:border-[#10b981] transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#10b981] transition-colors line-clamp-2">
                        {report.topic}
                      </h3>
                    </div>
                    {report.onChain && (
                      <Hexagon className="w-5 h-5 text-[#10b981] flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <p className="text-zinc-400 text-sm mb-4 line-clamp-3">
                    {report.executiveSummary}
                  </p>

                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{report.metadata?.totalSources || 0} sources</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#27272a]">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-zinc-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{report.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-400">
                        <MessageSquare className="w-4 h-4" />
                        <span>{report.commentCount || 0}</span>
                      </div>
                    </div>

                    {report.curatorName && (
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <User className="w-3 h-3" />
                        <span>{report.curatorName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg disabled:opacity-50 hover:border-[#10b981] transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                        page === i + 1
                          ? 'bg-[#10b981] text-black'
                          : 'bg-[#18181b] border border-[#27272a] text-white hover:border-[#10b981]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg disabled:opacity-50 hover:border-[#10b981] transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}