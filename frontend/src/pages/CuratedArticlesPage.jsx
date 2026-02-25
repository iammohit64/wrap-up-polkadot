import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Leaderboard from "../components/Leaderboard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Newspaper, BookOpen, ThumbsUp, MessageSquare, Target, Gem, Link2, Inbox, X, Filter } from "lucide-react";

const API_BASE = 'http://localhost:5000/api';

export default function CuratedArticlesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/articles/all`);
      setArticles(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (article) => {
    const articleId = article.id || article._id;
    if (articleId) navigate(`/curated/${articleId}`);
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-[#10b981] rounded-full border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23ffffff' fill='none'/%3E%3C/svg%3E")` }}
      />
      
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 relative z-10 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Intelligence Layer</h1>
                <p className="text-zinc-500 max-w-xl">Curated insights from the decentralized web. Verified by community, stored on Arbitrum.</p>
            </div>
            
            <div className="flex gap-4">
                 <div className="flex flex-col items-end px-4 py-2 border-r border-[#27272a]">
                    <span className="text-2xl font-bold">{articles.length}</span>
                    <span className="text-xs text-zinc-500 uppercase">Articles</span>
                 </div>
                 <div className="flex flex-col items-end px-4 py-2">
                    <span className="text-2xl font-bold">{articles.reduce((a,b) => a + (b.upvotes || 0), 0)}</span>
                    <span className="text-xs text-zinc-500 uppercase">Votes</span>
                 </div>
            </div>
        </div>

        <Leaderboard />

        {/* Filters & Actions */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#27272a]">
             <div className="flex items-center gap-2 text-lg font-bold">
                <BookOpen className="w-5 h-5 text-[#10b981]" /> All Entries
             </div>
             <button 
                onClick={() => navigate('/legacy')}
                className="bg-white text-black px-5 py-2 rounded text-sm font-bold uppercase hover:bg-[#10b981] transition-colors"
             >
                + Submit Article
             </button>
        </div>

        {/* Grid */}
        {error ? (
           <div className="p-8 border border-red-900/50 bg-red-900/10 rounded-xl text-center text-red-400">{error}</div>
        ) : articles.length === 0 ? (
           <div className="py-24 text-center border border-dashed border-[#27272a] rounded-xl">
               <Inbox className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
               <p className="text-zinc-500">No articles found in the registry.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {articles.map((article) => (
                <div 
                  key={article.id || article._id}
                  onClick={() => handleArticleClick(article)}
                  className="group bg-[#121214] border border-[#27272a] rounded-xl overflow-hidden cursor-pointer hover:border-[#10b981] transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                    <div className="h-48 overflow-hidden relative bg-[#18181b]">
                        {article.imageUrl && (
                            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        )}
                        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur border border-[#27272a] px-2 py-1 rounded text-[10px] font-bold uppercase text-zinc-400">
                             {article.curatorName ? 'Curated' : 'Raw'}
                        </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-[#10b981] transition-colors line-clamp-2">{article.title}</h3>
                        <p className="text-zinc-400 text-sm line-clamp-2 mb-6 flex-grow">{article.summary}</p>
                        
                        <div className="pt-4 border-t border-[#27272a] flex items-center justify-between text-xs text-zinc-500 font-mono">
                             <span>{new Date(article.createdAt || Date.now()).toLocaleDateString()}</span>
                             <div className="flex items-center gap-3">
                                 <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {article.upvotes}</span>
                                 <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {article.comments?.length || 0}</span>
                             </div>
                        </div>
                    </div>
                </div>
             ))}
           </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
