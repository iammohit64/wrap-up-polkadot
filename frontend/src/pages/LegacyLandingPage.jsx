import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useArticleStore } from "../stores/articleStore";
import { useAccount, useReadContract, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { 
  WRAPUP_ABI, CONTRACT_ADDRESSES, WUP_TOKEN_ABI, WUPToken_ADDRESSES, WUP_CLAIMER_ABI, WUPClaimer_ADDRESSES,
} from "../wagmiConfig";
import { decodeEventLog } from "viem";
import axios from "axios";
import { Search, X, Link2, BookOpen, Zap, Link as LinkIcon, Save, Layers, ArrowRight, ArrowLeft } from "lucide-react";

const API_BASE = 'http://localhost:5000/api';

export default function LegacyLandingPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scrapedPreview, setScrapedPreview] = useState(null);
  const [curatingStep, setCuratingStep] = useState('idle');
  const [submittedIpfsHash, setSubmittedIpfsHash] = useState(null);
  
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const chainId = useChainId(); // <--- ADD THIS

  // Dynamically select the correct addresses based on the connected chain
  // Fallback to a default chain ID (e.g., Arbitrum Sepolia 421614) if undefined
  const currentContractAddress = CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[421614];
  const currentTokenAddress = WUPToken_ADDRESSES[chainId] || WUPToken_ADDRESSES[421614];
  const currentClaimerAddress = WUPClaimer_ADDRESSES[chainId] || WUPClaimer_ADDRESSES[421614];
  
  const { switchChain } = useSwitchChain();
  const { markArticleOnChainDB } = useArticleStore();
  
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url.trim()) { toast.error('Please enter a valid URL'); return; }
    setLoading(true); setError(null); setScrapedPreview(null); setCuratingStep('idle'); setSubmittedIpfsHash(null);
    const loadingToast = toast.loading('Initializing scraper AI...');
    try {
      const response = await fetch(`${API_BASE}/articles/scrape`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Scraping failed');
      setScrapedPreview(data.preview); setCuratingStep('scraped');
      toast.success('Content extracted successfully!', { id: loadingToast });
    } catch (err) {
      setError(err.message); setScrapedPreview(null);
      toast.error(err.message || 'Failed to scrape', { id: loadingToast });
    } finally { setLoading(false); }
  };

  const handleCurationSubmit = async () => {
    if (!scrapedPreview) return;
    if (!isConnected) { toast.error("Connect wallet to curate"); return; }
    setLoading(true); setCuratingStep('preparing');
    const loadingToast = toast.loading('Uploading to decentralized storage...');
    try {
      const ipfsResponse = await axios.post(`${API_BASE}/articles/upload-ipfs`, scrapedPreview);
      const { ipfsHash } = ipfsResponse.data;
      if (!ipfsHash) throw new Error("IPFS upload failed");
      await axios.post(`${API_BASE}/articles/prepare`, { ...scrapedPreview, ipfsHash });
      setSubmittedIpfsHash(ipfsHash);
      toast.loading('Sign transaction in wallet...', { id: loadingToast });
      setCuratingStep('signing');
      const submitToContract = () => {
        writeContract({ address: currentContractAddress, abi: WRAPUP_ABI, functionName: 'submitArticle', args: [ipfsHash] });
      };

      // --- MULTI-CHAIN FIX STARTS HERE ---
      // Check if the current chain is in our list of supported addresses
      const isSupportedChain = !!CONTRACT_ADDRESSES[chainId];

      if (!isSupportedChain) {
        // If they are on an unsupported network, switch them to a default one (e.g., Arbitrum Sepolia: 421614)
        switchChain({ chainId: 421614 }, {
          onSuccess: () => submitToContract(),
          onError: () => { toast.error("Network switch failed", { id: loadingToast }); setLoading(false); }
        });
      } else { 
        // If they are on any supported chain, just submit!
        submitToContract(); 
      }
      // --- MULTI-CHAIN FIX ENDS HERE ---


    } catch (err) {
      setError(err.message); setCuratingStep('scraped');
      toast.error(err.message || 'Submission failed', { id: loadingToast });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConfirming) { setCuratingStep('confirming'); toast.loading('Confirming on Blockchain...', { id: "loadingToast" }); }
    if (isConfirmed && receipt) {
      setCuratingStep('done');
      toast.success('Curated on-chain!', { id: "loadingToast" });
      let articleId = null;
      try {
        for (const log of receipt.logs) {
          const event = decodeEventLog({ abi: WRAPUP_ABI, data: log.data, topics: log.topics });
          if (event.eventName === 'ArticleSubmitted') { articleId = event.args.articleId.toString(); break; }
        }
      } catch (err) { console.error("Log parse error:", err); }

      if (articleId && submittedIpfsHash && address) {
        markArticleOnChainDB(scrapedPreview.articleUrl, articleId, address, submittedIpfsHash)
          .catch(err => toast.error("DB Sync failed"));
      }
      setTimeout(() => navigate('/curated'), 1500);
    }
    if (isPending === false && isConfirming === false && loading && curatingStep === 'signing') {
       setLoading(false); setCuratingStep('scraped'); toast.error("Transaction rejected", { id: "loadingToast" });
    }
  }, [isConfirming, isConfirmed, isPending, receipt]);

  const handleReset = () => { setUrl(''); setScrapedPreview(null); setError(null); setCuratingStep('idle'); setSubmittedIpfsHash(null); };

  const getButtonText = () => {
    if (curatingStep === 'preparing') return 'Uploading...';
    if (curatingStep === 'signing') return 'Sign in Wallet';
    if (isPending || curatingStep === 'confirming') return 'Confirming...';
    if (curatingStep === 'done') return 'Success!';
    return 'Sign & Mint';
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-[#10b981] selection:text-black flex flex-col">
       <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23ffffff' fill='none'/%3E%3C/svg%3E")` }}
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-20 relative z-10 flex-grow flex flex-col justify-center">
        {/* Legacy Mode Badge */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 bg-[#18181b] border border-[#27272a] px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to AI Research Engine</span>
          </button>
        </div>

        <div className="max-w-5xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-full mb-6">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">Legacy Mode</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
                Wrap-Up any <span className="text-[#10b981]">Article.</span>
            </h1>
            <p className="text-zinc-500 text-xl max-w-2xl mx-auto leading-relaxed">
                Traditional link-based curation. Scrape, analyze, and mint articles to the blockchain.
            </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-3xl mx-auto mb-24">
             <div className="bg-[#121214] border border-[#27272a] p-2 rounded-2xl flex flex-col sm:flex-row gap-3 shadow-2xl shadow-black/50 transition-all hover:border-zinc-500 focus-within:border-[#10b981]">
                <input 
                    type="url" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste article URL here..."
                    className="flex-1 bg-transparent px-6 py-4 text-white placeholder-zinc-600 focus:outline-none text-lg w-full"
                    disabled={loading}
                />
                <button 
                    onClick={handleScrape}
                    disabled={loading}
                    className="bg-[#10b981] hover:bg-[#059669] text-black px-8 py-4 rounded-xl font-bold uppercase tracking-wide text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    {loading && curatingStep === 'idle' ? <div className="animate-spin h-5 w-5 border-2 border-black rounded-full border-t-transparent"></div> : <Search className="w-5 h-5" />}
                    <span>Analyze</span>
                </button>
             </div>
        </div>

        {error && (
            <div className="max-w-xl mx-auto mb-10 bg-red-900/10 border border-red-900/50 text-red-400 p-3 rounded-lg text-center font-mono text-xs">
                Error: {error}
            </div>
        )}

        {/* Preview Section */}
        {scrapedPreview && (
            <div className="max-w-4xl mx-auto bg-[#121214] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl animate-fade-in-up mb-16">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#18181b]">
                    <div className="flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                         <span className="font-mono text-xs text-zinc-400 uppercase">Ready to Mint</span>
                    </div>
                    <button onClick={handleReset}><X className="w-5 h-5 text-zinc-500 hover:text-white" /></button>
                </div>
                
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-8 mb-6">
                        {scrapedPreview.imageUrl && (
                            <div className="w-full md:w-1/3 aspect-video bg-[#000] rounded-lg overflow-hidden border border-[#27272a]">
                                <img src={scrapedPreview.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{scrapedPreview.title}</h2>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-3">{scrapedPreview.summary}</p>
                            <div className="flex flex-wrap gap-2">
                                {scrapedPreview.keyPoints?.slice(0,2).map((pt, i) => (
                                    <span key={i} className="text-[10px] bg-[#27272a] text-zinc-300 px-2 py-1 rounded border border-[#3f3f46]">{pt.substring(0, 35)}...</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-6 border-t border-[#27272a]">
                         <button
                            onClick={handleCurationSubmit}
                            disabled={loading || isPending || isConfirming || !isConnected}
                            className={`px-8 py-3 rounded font-bold uppercase text-sm tracking-wide flex items-center gap-2 ${
                                !isConnected ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200'
                            }`}
                         >
                            {!isConnected ? 'Connect Wallet' : getButtonText()}
                            {isConnected && !loading && <ArrowRight className="w-4 h-4" />}
                         </button>
                    </div>
                </div>
            </div>
        )}

        {/* Steps Grid */}
        {!scrapedPreview && !loading && (
            <div className="w-full pt-16 border-t border-[#27272a] mt-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
                    {[
                        { icon: Search, title: "Input", desc: "Paste any article URL directly." },
                        { icon: Zap, title: "Process", desc: "AI extracts & summarizes insights." },
                        { icon: Save, title: "Store", desc: "Permanent IPFS decentralized storage." },
                        { icon: Link2, title: "Mint", desc: "Verifiable record on Arbitrum Chain." }
                    ].map((step, i) => (
                        <div key={i} className="group p-8 rounded-2xl border border-[#27272a] bg-[#121214]/50 hover:bg-[#121214] hover:border-[#10b981] transition-all duration-300">
                            <div className="w-12 h-12 bg-[#18181b] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-[#27272a]">
                                <step.icon className="w-6 h-6 text-white group-hover:text-[#10b981] transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-base text-zinc-500 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}