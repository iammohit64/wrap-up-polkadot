import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar 
} from "recharts";
import axios from "axios";
import toast from "react-hot-toast";
import { useArticleStore } from "../stores/articleStore";
import { 
  useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, 
  useSwitchChain, useWatchContractEvent, useDisconnect, useChainId
} from "wagmi";
import { WRAPUP_ABI, CONTRACT_ADDRESSES, WUP_TOKEN_ABI, WUPToken_ADDRESSES, WUP_CLAIMER_ABI, WUPClaimer_ADDRESSES } from "../wagmiConfig";
import { decodeEventLog } from "viem";
import { 
  Download, ExternalLink, AlertCircle, TrendingUp, MessageSquare, 
  BarChart3, Globe, CheckCircle, XCircle, ChevronDown, ChevronUp, 
  FileText, ThumbsUp, Hexagon, Link2, Share2
} from "lucide-react";

const API_BASE = 'http://localhost:5000/api';

const SENTIMENT_COLORS = {
  Positive: "#10b981",
  Negative: "#ef4444",
  Neutral: "#6b7280",
  Balanced: "#8b5cf6"
};

const PLATFORM_COLORS = {
  Web: "#3b82f6",
  Twitter: "#1da1f2",
  Reddit: "#ff4500",
  News: "#f59e0b",
  Academic: "#8b5cf6",
  Medium: "#00ab6c",
  Github: "#333333"
};

export default function ResearchReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSources, setExpandedSources] = useState({});
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [pendingCommentData, setPendingCommentData] = useState(null);
  const [hasUpvotedResearchLocal, setHasUpvotedResearchLocal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uploadingToChain, setUploadingToChain] = useState(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId(); // <--- ADD THIS

  // Dynamically select the correct addresses based on the connected chain
  // Fallback to a default chain ID (e.g., Arbitrum Sepolia 421614) if undefined
  const currentContractAddress = CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[421614];
  const currentTokenAddress = WUPToken_ADDRESSES[chainId] || WUPToken_ADDRESSES[421614];
  const currentClaimerAddress = WUPClaimer_ADDRESSES[chainId] || WUPClaimer_ADDRESSES[421614];

  const { switchChain } = useSwitchChain();
  
  const { 
    loadResearch, uploadResearchToIPFS, markResearchOnChainDB, 
    prepareResearchCommentForChain, markResearchCommentOnChainDB,
    syncResearchUpvotesDB, syncResearchCommentUpvotesDB
  } = useArticleStore();

  useEffect(() => {
    if (!isRefreshing) {
      fetchResearch();
    }
  }, [id, isRefreshing]);

  const fetchResearch = async () => {
    try {
      setLoading(true);
      const data = await loadResearch(id);
      setResearch(JSON.parse(JSON.stringify(data)));
    } catch (err) {
      setError(err.message || "Failed to load research");
    } finally {
      setLoading(false);
    }
  };

  // Blockchain hooks
  const { data: voteHash, isPending: isVoting, writeContract: writeVote, error: voteError } = useWriteContract();
  const { data: commentHash, isPending: isCommenting, writeContract: writeComment, error: commentError } = useWriteContract();
  const { data: publishHash, isPending: isPublishing, writeContract: writePublish } = useWriteContract();
  
  const { isLoading: isVoteConfirming, isSuccess: isVoteConfirmed, data: voteReceipt } = useWaitForTransactionReceipt({ hash: voteHash });
  const { isLoading: isCommentConfirming, isSuccess: isCommentConfirmed, data: commentReceipt } = useWaitForTransactionReceipt({ hash: commentHash });
  const { isLoading: isPublishConfirming, isSuccess: isPublishConfirmed, data: publishReceipt } = useWaitForTransactionReceipt({ hash: publishHash });

  const { data: hasUpvotedResearch, refetch: refetchHasUpvotedResearch } = useReadContract({
    abi: WRAPUP_ABI,
    address: currentContractAddress,
    functionName: 'hasUserUpvotedArticle',
    args: [address, research?.blockchainId],
    enabled: isConnected && !!research?.blockchainId && research?.onChain
  });

  const { data: userDisplayName } = useReadContract({
    abi: WRAPUP_ABI,
    address: currentContractAddress,
    functionName: 'getDisplayName',
    args: [address],
    enabled: isConnected && !!address
  });

  useEffect(() => {
    if (hasUpvotedResearch !== undefined) {
      setHasUpvotedResearchLocal(hasUpvotedResearch);
    }
  }, [hasUpvotedResearch]);

  // Watch for new comments
  useWatchContractEvent({
    address: currentContractAddress,
    abi: WRAPUP_ABI,
    eventName: 'CommentPosted',
    enabled: !!research?.blockchainId && research?.onChain,
    onLogs(logs) {
      for (const log of logs) {
        try {
          const event = decodeEventLog({ abi: WRAPUP_ABI, data: log.data, topics: log.topics });
          if (research?.blockchainId && event.args.articleId === BigInt(research.blockchainId)) {
            fetchResearch();
            toast.success("New comment detected!");
          }
        } catch (decodeError) {
          console.log("Skipping log:", decodeError);
        }
      }
    }
  });

  const callContract = (writeFn, config, toastId) => {
    // Check if the current chain is supported (i.e., we have a contract address for it)
    const isSupportedChain = !!CONTRACT_ADDRESSES[chainId];

    if (!isSupportedChain) {
      toast.loading("Switching to supported network...", { id: toastId });
      // Fallback to your primary chain ID (e.g., Arbitrum Sepolia 421614)
      switchChain({ chainId: 421614 }, {
        onSuccess: () => {
          toast.loading('Please confirm in wallet...', { id: toastId });
          // Note: Because state updates async, the immediate writeFn might still 
          // use the old config address. It's safer to let Wagmi handle the switch, 
          // or re-fetch the correct address for 421614 here.
          const updatedConfig = { ...config, address: CONTRACT_ADDRESSES[421614] };
          writeFn(updatedConfig);
        },
        onError: () => {
          toast.error("Network switch failed", { id: toastId });
        }
      });
    } else {
      // User is on a valid chain (Arbitrum, Base, etc.), proceed normally
      writeFn(config);
    }
  };

  const handlePublishToBlockchain = async () => {
    if (!isConnected) {
      toast.error("Please connect wallet to publish on-chain");
      return;
    }

    if (research.onChain) {
      toast.error("Already published on blockchain");
      return;
    }

    setUploadingToChain(true);
    const toastId = toast.loading("Uploading to IPFS...");

    try {
      // Step 1: Upload to IPFS
      const ipfsHash = await uploadResearchToIPFS(research.id);
      
      // Step 2: Publish to blockchain
      toast.loading("Sign transaction in wallet...", { id: toastId });
      
      callContract(writePublish, {
        address: currentContractAddress,
        abi: WRAPUP_ABI,
        functionName: 'submitArticle',
        args: [ipfsHash]
      }, toastId);
      
    } catch (err) {
      toast.error(err.message || "Failed to upload", { id: toastId });
      setUploadingToChain(false);
    }
  };

  useEffect(() => {
    if (isPublishConfirming) {
      toast.loading("Publishing to blockchain...", { id: "publishToast" });
    }
    
    if (isPublishConfirmed && publishReceipt) {
      toast.loading("Finalizing...", { id: "publishToast" });
      
      let blockchainId = null;
      try {
        for (const log of publishReceipt.logs) {
          const event = decodeEventLog({ abi: WRAPUP_ABI, data: log.data, topics: log.topics });
          if (event.eventName === 'ArticleSubmitted') {
            blockchainId = event.args.articleId.toString();
            break;
          }
        }
      } catch (err) {
        console.error("Log parse error:", err);
      }

      if (blockchainId && address) {
        markResearchOnChainDB(research.id, blockchainId, address, research.ipfsHash || '')
          .then(() => {
            toast.success("Published on blockchain!", { id: "publishToast" });
            setUploadingToChain(false);
            setTimeout(() => fetchResearch(), 2000);
          })
          .catch(err => {
            toast.error("DB sync failed", { id: "publishToast" });
            setUploadingToChain(false);
          });
      }
    }
  }, [isPublishConfirming, isPublishConfirmed, publishReceipt]);

  const handleUpvoteResearch = async () => {
    if (!isConnected) {
      toast.error("Please connect wallet");
      return;
    }

    if (!research.onChain) {
      toast.error("Research must be on-chain to upvote");
      return;
    }

    if (hasUpvotedResearchLocal) {
      toast.error("Already upvoted");
      return;
    }

    const toastId = toast.loading('Processing upvote...');
    setResearch(prev => ({ ...prev, upvotes: prev.upvotes + 1 }));
    setHasUpvotedResearchLocal(true);

    callContract(writeVote, {
      address: currentContractAddress,
      abi: WRAPUP_ABI,
      functionName: 'upvoteArticle',
      args: [research.blockchainId]
    }, toastId);
  };

  useEffect(() => {
    if (isVoteConfirmed && voteReceipt) {
      toast.success('Vote confirmed!', { id: "voteToast" });
      
      let upvotes = 0;
      try {
        for (const log of voteReceipt.logs) {
          const event = decodeEventLog({ abi: WRAPUP_ABI, data: log.data, topics: log.topics });
          if (event.eventName === 'ArticleUpvoted') {
            upvotes = Number(event.args.newUpvoteCount);
            break;
          }
        }
      } catch (err) {
        console.error("Parse error:", err);
      }

      if (upvotes > 0) {
        syncResearchUpvotesDB(research.id, upvotes);
      }

      setTimeout(async () => {
        await fetchResearch();
        await refetchHasUpvotedResearch();
      }, 3000);
    }
  }, [isVoteConfirmed, voteReceipt]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    if (!isConnected) {
      toast.error("Please connect wallet to comment");
      return;
    }
    if (!research.onChain) {
      toast.error("Research must be on-chain to comment");
      return;
    }

    const toastId = toast.loading('Preparing comment...');

    try {
      const { commentMongoId, onChainResearchId, ipfsHash } = await prepareResearchCommentForChain({
        researchId: research.id,
        content: commentText.trim(),
        author: address,
        authorName: userDisplayName || (address ? `${address.substring(0, 6)}...${address.substring(38)}` : '')
      });

      setPendingCommentData({ commentMongoId, ipfsHash });
      
      setResearch(prev => ({
        ...prev,
        comments: [{
          id: commentMongoId,
          content: commentText.trim(),
          author: address,
          authorName: userDisplayName || '',
          upvotes: 0,
          onChain: false,
          createdAt: new Date().toISOString(),
          replies: []
        }, ...(prev.comments || [])]
      }));
      
      setCommentText("");
      toast.loading('Please confirm in wallet...', { id: toastId });

      callContract(writeComment, {
        address: currentContractAddress,
        abi: WRAPUP_ABI,
        functionName: 'postComment',
        args: [onChainResearchId, ipfsHash]
      }, toastId);
      
    } catch (err) {
      toast.error(err.message || 'Failed to prepare comment', { id: toastId });
      await fetchResearch();
    }
  };

  useEffect(() => {
    if (isCommentConfirmed && commentReceipt && pendingCommentData) {
      toast.success('Comment posted!', { id: "commentToast" });

      let onChainCommentId = null;
      try {
        for (const log of commentReceipt.logs) {
          const event = decodeEventLog({ abi: WRAPUP_ABI, data: log.data, topics: log.topics });
          if (event.eventName === 'CommentPosted') {
            onChainCommentId = event.args.commentId.toString();
            break;
          }
        }
      } catch (err) {
        console.error("Parse error:", err);
      }

      if (onChainCommentId) {
        markResearchCommentOnChainDB(
          pendingCommentData.commentMongoId,
          onChainCommentId,
          pendingCommentData.ipfsHash
        );
      }

      setTimeout(() => fetchResearch(), 3000);
    }
  }, [isCommentConfirmed, commentReceipt, pendingCommentData]);

  const handleUpvoteComment = async (comment) => {
    if (!isConnected) {
      toast.error("Please connect wallet");
      return;
    }

    if (!comment.onChain) {
      toast.error("Comment not on-chain yet");
      return;
    }

    if (comment.upvotedBy?.some(vote => 
      typeof vote === 'string' ? vote === address : vote.address?.toLowerCase() === address?.toLowerCase()
    )) {
      toast.error("Already upvoted");
      return;
    }

    const toastId = toast.loading('Upvoting comment...');

    callContract(writeVote, {
      address: currentContractAddress,
      abi: WRAPUP_ABI,
      functionName: 'upvoteComment',
      args: [comment.commentId]
    }, toastId);
  };

  const toggleSource = (idx) => {
    setExpandedSources(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const downloadPDF = () => {
    alert("PDF download coming soon!");
  };

  const renderComment = (comment, isReply = false) => {
    const hasUpvoted = comment.upvotedBy?.some(vote => 
      typeof vote === 'string' ? vote === address : vote.address?.toLowerCase() === address?.toLowerCase()
    );
    const isCommenter = comment.author?.toLowerCase() === address?.toLowerCase();
    const canUpvote = isConnected && !isCommenter && !hasUpvoted && comment.onChain;

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 pl-8 border-l border-[#27272a] mt-4' : 'mb-6 pb-6 border-b border-[#27272a] last:border-0'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#27272a] rounded-lg border border-[#3f3f46] flex items-center justify-center text-white text-xs font-bold">
              {(comment.authorName || 'A')[0].toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-white text-sm block">{comment.authorName || 'Anonymous'}</span>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">
                {new Date(comment.createdAt).toLocaleDateString()} • {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpvoteComment(comment)}
              disabled={!canUpvote}
              className={`flex items-center gap-1.5 px-3 py-1 rounded border text-xs font-medium transition-colors ${
                !canUpvote ? 'border-transparent text-zinc-600' : 'border-[#27272a] text-zinc-400 hover:text-[#10b981] hover:border-[#10b981]'
              }`}
            >
              <ThumbsUp className="w-3 h-3" /> <span>{comment.upvotes}</span>
            </button>
            {comment.onChain ? (
              <Hexagon className="w-3 h-3 text-[#10b981]" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            )}
          </div>
        </div>

        <p className="text-zinc-300 mb-3 leading-relaxed text-sm">{comment.content}</p>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">{comment.replies.map(reply => renderComment(reply, true))}</div>
        )}
      </div>
    );
  };

  if (loading || !research) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#10b981] rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading research report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#10b981] text-black px-6 py-3 rounded-lg font-bold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const viz = research.visualizationData;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-zinc-500 hover:text-white mb-4 flex items-center gap-2 text-sm"
          >
            ← Back to Research
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{research.topic}</h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-[#18181b] border border-[#27272a] px-3 py-1 rounded">
                  {viz.totalSources} Sources Analyzed
                </span>
                <span className="bg-[#18181b] border border-[#27272a] px-3 py-1 rounded">
                  {new Date(research.createdAt).toLocaleDateString()}
                </span>
                {research.onChain ? (
                  <span className="bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] px-3 py-1 rounded flex items-center gap-2">
                    <Hexagon className="w-3 h-3" /> On-Chain
                  </span>
                ) : (
                  <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-3 py-1 rounded">
                    Off-Chain
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {!research.onChain && isConnected && (
                <button
                  onClick={handlePublishToBlockchain}
                  disabled={uploadingToChain || isPublishing || isPublishConfirming}
                  className="bg-[#10b981] text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#059669] transition-colors disabled:opacity-50"
                >
                  <Link2 className="w-5 h-5" />
                  {uploadingToChain || isPublishing || isPublishConfirming ? 'Publishing...' : 'Publish On-Chain'}
                </button>
              )}
              
              <button
                onClick={downloadPDF}
                className="bg-white text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Credibility Disclaimer */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-zinc-300">
              <strong className="text-yellow-500">Credibility Notice:</strong> This report 
              synthesizes information from multiple sources. Always verify critical information 
              with original sources. AI-generated content may contain inaccuracies.
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="bg-[#121214] border border-[#27272a] rounded-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-[#10b981]" />
            <h2 className="text-2xl font-bold">Executive Summary</h2>
          </div>
          <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-line">
            {research.executiveSummary}
          </p>
        </section>

        {/* Key Insights */}
        <section className="bg-[#121214] border border-[#27272a] rounded-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-[#10b981]" />
            <h2 className="text-2xl font-bold">Key Insights</h2>
          </div>
          <div className="space-y-4">
            {research.keyInsights.map((insight, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#10b981]/10 border border-[#10b981]/30 rounded-full flex items-center justify-center text-[#10b981] font-bold text-sm">
                  {idx + 1}
                </div>
                <p className="text-zinc-300 pt-1">{insight}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Upvote Section */}
        {research.onChain && (
          <section className="bg-[#121214] border border-[#27272a] rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{research.upvotes}</div>
                  <div className="text-xs text-zinc-500 uppercase">Upvotes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{research.comments?.length || 0}</div>
                  <div className="text-xs text-zinc-500 uppercase">Comments</div>
                </div>
              </div>
              
              <button
                onClick={handleUpvoteResearch}
                disabled={!isConnected || hasUpvotedResearchLocal || isVoting}
                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors ${
                  !isConnected || hasUpvotedResearchLocal || isVoting
                    ? 'bg-[#27272a] text-zinc-600 cursor-not-allowed'
                    : 'bg-[#10b981] text-black hover:bg-[#059669]'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                {isVoting ? 'Voting...' : hasUpvotedResearchLocal ? 'Upvoted' : 'Upvote Research'}
              </button>
            </div>
          </section>
        )}

        {/* Visualizations */}
        <section className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Sentiment Distribution */}
          <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#10b981]" />
              Sentiment Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={viz.sentimentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ sentiment, percentage }) => `${sentiment}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {viz.sentimentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.sentiment] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Distribution */}
          <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#10b981]" />
              Source Platforms
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={viz.platformDistribution}>
                <XAxis dataKey="platform" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Credibility Distribution */}
          <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6">Source Credibility</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={viz.credibilityDistribution} layout="vertical">
                <XAxis type="number" stroke="#6b7280" />
                <YAxis type="category" dataKey="level" stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Thematic Clusters */}
          <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6">Thematic Clusters</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={viz.thematicClusters}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="theme" stroke="#6b7280" />
                <PolarRadiusAxis stroke="#6b7280" />
                <Radar name="Topics" dataKey="count" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Comments Section */}
        {research.onChain && (
          <section className="bg-[#121214] border border-[#27272a] rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#10b981]" />
              Discussion ({research.comments?.length || 0})
            </h2>

            {isConnected ? (
              <form onSubmit={handleComment} className="mb-12 flex gap-4">
                <div className="w-10 h-10 bg-[#27272a] rounded-lg border border-[#3f3f46] flex-shrink-0"></div>
                <div className="flex-grow">
                  <textarea
                    className="w-full bg-transparent border-b border-[#27272a] p-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981] transition-colors resize-none"
                    rows={2}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add to the discussion..."
                    disabled={isCommenting}
                  />
                  <div className="flex justify-end mt-2">
                    <button 
                      type="submit" 
                      disabled={isCommenting || !commentText.trim()} 
                      className="bg-white text-black px-6 py-2 rounded font-bold text-sm uppercase hover:bg-zinc-200 disabled:opacity-50"
                    >
                      {isCommenting ? 'Posting...' : 'Comment'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-[#18181b] p-6 text-center border border-[#27272a] rounded-lg mb-8">
                <p className="text-zinc-500 text-sm">Connect wallet to join the conversation.</p>
              </div>
            )}

            <div className="space-y-2">
              {research.comments?.length > 0 ? (
                research.comments.map(c => renderComment(c))
              ) : (
                <p className="text-zinc-600 italic">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </section>
        )}

        {/* Comparative Analysis */}
        <section className="bg-[#121214] border border-[#27272a] rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Comparative Analysis</h2>
           
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#27272a]">
                  <th className="pb-3 pr-4 text-zinc-500 font-medium text-sm">Source</th>
                  <th className="pb-3 pr-4 text-zinc-500 font-medium text-sm">Platform</th>
                  <th className="pb-3 pr-4 text-zinc-500 font-medium text-sm">Main Argument</th>
                  <th className="pb-3 pr-4 text-zinc-500 font-medium text-sm">Sentiment</th>
                  <th className="pb-3 text-zinc-500 font-medium text-sm">Credibility</th>
                </tr>
              </thead>
              <tbody>
                {research.comparativeAnalysis.comparisonTable.map((row, idx) => (
                  <tr key={idx} className="border-b border-[#27272a] hover:bg-[#18181b]">
                    <td className="py-4 pr-4">
                      <a 
                        href={row.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#10b981] hover:underline flex items-center gap-2"
                      >
                        {row.source.substring(0, 40)}...
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-4 pr-4 text-zinc-400">{row.platform}</td>
                    <td className="py-4 pr-4 text-zinc-300">{row.mainArgument.substring(0, 80)}...</td>
                    <td className="py-4 pr-4">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: SENTIMENT_COLORS[row.sentiment] + '20',
                          color: SENTIMENT_COLORS[row.sentiment]
                        }}
                      >
                        {row.sentiment}
                      </span>
                    </td>
                    <td className="py-4 capitalize text-zinc-400">{row.credibility}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Insights */}
          {research.comparativeAnalysis.insights && (
            <div className="space-y-4">
              <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Patterns Identified:</h4>
                <ul className="list-disc list-inside text-zinc-400 space-y-1">
                  {research.comparativeAnalysis.insights.patterns?.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                <h4 className="font-bold text-white mb-2">Major Agreements:</h4>
                <ul className="list-disc list-inside text-zinc-400 space-y-1">
                  {research.comparativeAnalysis.insights.majorAgreements?.map((a, idx) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Consensus vs Contradiction */}
        <section className="bg-[#121214] border border-[#27272a] rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#10b981]" />
            Consensus vs. Contradiction
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Widely Agreed Points */}
            <div className="bg-[#18181b] border border-[#10b981]/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-[#10b981]" />
                <h3 className="font-bold text-lg">Widely Agreed Points</h3>
              </div>
              <ul className="space-y-3">
                {research.consensusVsContradiction.widelyAgreedPoints?.map((point, idx) => (
                  <li key={idx} className="flex gap-3 text-zinc-300">
                    <span className="text-[#10b981] flex-shrink-0">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Debated Views */}
            <div className="bg-[#18181b] border border-orange-500/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-lg">Debated Views</h3>
              </div>
              <div className="space-y-4">
                {research.consensusVsContradiction.debatedViews?.map((debate, idx) => (
                  <div key={idx} className="border-l-2 border-orange-500/50 pl-3">
                    <h4 className="font-medium text-white mb-1">{debate.topic}</h4>
                    <ul className="text-sm text-zinc-400 space-y-1">
                      {debate.positions?.map((pos, pidx) => (
                        <li key={pidx}>• {pos}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Minority Perspectives */}
          {research.consensusVsContradiction.minorityPerspectives?.length > 0 && (
            <div className="bg-purple-900/10 border border-purple-500/30 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3 text-purple-400">Minority Perspectives</h3>
              <ul className="space-y-2 text-zinc-300">
                {research.consensusVsContradiction.minorityPerspectives.map((p, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-purple-400">◆</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ─── SOURCE COMPARISON REPORT ─────────────────────────────────── */}
        {research.sourceComparisonReport && (
          <section className="bg-[#121214] border border-[#27272a] rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#10b981]" />
              Source Comparison Report
            </h2>
            <p className="text-zinc-500 text-sm mb-8">
              AI-rated comparison of every source analyzed for this report.
            </p>

            {/* Ratings Table */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#27272a]">
                    {['#', 'Source', 'Platform', 'Credibility', 'Depth', 'Bias', 'Uniqueness', 'Notes'].map(
                      (h) => (
                        <th key={h} className="pb-3 pr-4 text-left text-zinc-500 font-medium text-xs uppercase tracking-wider">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(research.sourceComparisonReport.sourceRatings || []).map((s) => {
                    const isRecommended = (research.sourceComparisonReport.recommendedReading || []).includes(s.index);
                    return (
                      <tr
                        key={s.index}
                        className={`border-b border-[#27272a] hover:bg-[#18181b] transition-colors ${isRecommended ? 'bg-[#10b981]/5' : ''}`}
                      >
                        <td className="py-3 pr-4 text-zinc-500 font-mono">{s.index}</td>
                        <td className="py-3 pr-4 max-w-[180px]">
                          <a 
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#10b981] hover:underline flex items-center gap-1 text-xs"
                          >
                            <span className="truncate">{s.title?.substring(0, 35)}…</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                          {isRecommended && (
                            <span className="text-[10px] bg-[#10b981]/20 text-[#10b981] px-1.5 py-0.5 rounded mt-1 inline-block">
                              ★ Recommended
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-zinc-400 capitalize text-xs">{s.platform}</td>

                        {/* Score bars */}
                        {[
                          { val: s.credibility, color: '#10b981' },
                          { val: s.depth, color: '#3b82f6' },
                        ].map((bar, i) => (
                          <td key={i} className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${bar.val * 10}%`, backgroundColor: bar.color }}
                                />
                              </div>
                              <span className="text-xs text-zinc-300 font-mono">{bar.val}/10</span>
                            </div>
                          </td>
                        ))}

                        <td className="py-3 pr-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium ${
                              s.bias === 'Low'
                                ? 'bg-green-900/30 text-green-400'
                                : s.bias === 'High'
                                ? 'bg-red-900/30 text-red-400'
                                : 'bg-yellow-900/30 text-yellow-400'
                            }`}
                          >
                            {s.bias}
                          </span>
                        </td>

                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-purple-500"
                                style={{ width: `${s.uniqueness * 10}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-300 font-mono">{s.uniqueness}/10</span>
                          </div>
                        </td>

                        <td className="py-3 text-zinc-500 text-xs max-w-[160px]">
                          <span className="line-clamp-2">{s.oneLiner}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Highlights row */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {research.sourceComparisonReport.mostCredibleSource && (
                <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-4">
                  <div className="text-xs font-bold text-[#10b981] uppercase tracking-wider mb-2">
                    🏆 Most Credible Source
                  </div>
                  <div className="text-white font-medium text-sm">
                    #{research.sourceComparisonReport.mostCredibleSource.index}
                  </div>
                  <div className="text-zinc-400 text-xs mt-1">
                    {research.sourceComparisonReport.mostCredibleSource.reason}
                  </div>
                </div>
              )}
              {research.sourceComparisonReport.mostUniqueSource && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                    💡 Most Unique Perspective
                  </div>
                  <div className="text-white font-medium text-sm">
                    #{research.sourceComparisonReport.mostUniqueSource.index}
                  </div>
                  <div className="text-zinc-400 text-xs mt-1">
                    {research.sourceComparisonReport.mostUniqueSource.reason}
                  </div>
                </div>
              )}
              {research.sourceComparisonReport.overallVerdict && (
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    📋 Overall Verdict
                  </div>
                  <div className="text-zinc-300 text-xs leading-relaxed">
                    {research.sourceComparisonReport.overallVerdict}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Detailed Sources */}
        <section className="bg-[#121214] border border-[#27272a] rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Source Details</h2>
          <div className="space-y-4">
            {research.sources.map((source, idx) => (
              <div key={idx} className="border border-[#27272a] rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSource(idx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#18181b] transition-colors"
                >
                  <div className="flex items-center gap-3 text-left flex-1">
                    <span className="text-zinc-600 font-mono text-sm">#{idx + 1}</span>
                    <div>
                      <h3 className="font-bold text-white">{source.title}</h3>
                      <p className="text-sm text-zinc-500">{source.platform} • {source.url}</p>
                    </div>
                  </div>
                  {expandedSources[idx] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {expandedSources[idx] && (
                  <div className="border-t border-[#27272a] p-6 bg-[#18181b] space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-500 mb-2">MAIN ARGUMENT</h4>
                      <p className="text-zinc-300">{source.analysis?.mainArgument}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-500 mb-2">KEY CLAIMS</h4>
                      <ul className="list-disc list-inside text-zinc-300 space-y-1">
                        {source.analysis?.keyClaims?.map((claim, cidx) => (
                          <li key={cidx}>{claim}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-xs text-zinc-500">SENTIMENT</span>
                        <div 
                          className="px-3 py-1 rounded font-medium mt-1"
                          style={{ 
                            backgroundColor: SENTIMENT_COLORS[source.analysis?.sentiment] + '20',
                            color: SENTIMENT_COLORS[source.analysis?.sentiment]
                          }}
                        >
                          {source.analysis?.sentiment}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500">CREDIBILITY</span>
                        <div className="text-white mt-1 capitalize">
                          {source.analysis?.credibilityIndicators?.authorityLevel || 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <a 
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#10b981] hover:underline"
                    >
                      View Original Source <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}