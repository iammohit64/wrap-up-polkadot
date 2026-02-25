import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useArticleStore } from "../stores/articleStore";
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useReadContract, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { 
  WUP_CLAIMER_ABI, CONTRACT_ADDRESSES, WRAPUP_ABI, WUPToken_ADDRESSES, WUP_TOKEN_ABI, WUPClaimer_ADDRESSES,
} from "../wagmiConfig";
import toast from "react-hot-toast";
import axios from "axios";
import { 
  Menu, X, Star, Award, Link2, Layers, Check, ChevronRight, 
  Brain, FileText, LogOut, Wallet
} from "lucide-react";

const API_BASE = 'http://localhost:5000/api';

export default function Navbar() {
  const { userPoints, displayName, setUserPoints, setDisplayName } = useArticleStore();
  const [newName, setNewName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [savingToDb, setSavingToDb] = useState(false);
  
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
   
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId(); // <--- ADD THIS

  // Dynamically select the correct addresses based on the connected chain
  // Fallback to a default chain ID (e.g., Arbitrum Sepolia 421614) if undefined
  const currentContractAddress = CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[421614];
  const currentTokenAddress = WUPToken_ADDRESSES[chainId] || WUPToken_ADDRESSES[421614];
  const currentClaimerAddress = WUPClaimer_ADDRESSES[chainId] || WUPClaimer_ADDRESSES[421614];
  const { open } = useWeb3Modal();

  const { data: pointsData, refetch: refetchPoints } = useReadContract({
    abi: WRAPUP_ABI,
    address: currentContractAddress,
    functionName: 'getUserPoints',
    args: [address],
    enabled: isConnected && !!address,
  });

  const { data: nameData, refetch: refetchName } = useReadContract({
    abi: WRAPUP_ABI,
    address: currentContractAddress,
    functionName: 'getDisplayName',
    args: [address],
    enabled: isConnected && !!address,
  });

  const { data: wupBalance, refetch: refetchWupBalance } = useReadContract({
    address: currentTokenAddress,
    abi: WUP_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: isConnected && !!address && !!currentTokenAddress,  
  });

  // NEW: Read how many points the user has already claimed
  const { data: claimedPointsData, refetch: refetchClaimedPoints } = useReadContract({
    address: currentClaimerAddress,
    abi: WUP_CLAIMER_ABI, // (Make sure this matches whatever you exported from wagmiConfig)
    functionName: 'claimedPoints',
    args: [address],
    enabled: isConnected && !!address,
  });
  
  // Calculate how many points they can currently claim
  const claimablePoints = (userPoints || 0) - (Number(claimedPointsData) || 0);

  const { data: hash, isPending, writeContract, error: writeError, isError: isWriteError } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    error: receiptError, 
    isError: isReceiptError 
  } = useWaitForTransactionReceipt({ hash });

  const {
    data: claimHash,
    isPending: isClaiming,
    writeContract: claimRewards,
  } = useWriteContract();

  const { isLoading: isConfirmingClaim, isSuccess: isClaimConfirmed } =
    useWaitForTransactionReceipt({ hash: claimHash });

  useEffect(() => {
    if (isConnected && address) {
      refetchPoints();
      refetchName();
      refetchWupBalance();
      refetchClaimedPoints();
      fetchUserFromDb(address);
    } else {
      setUserPoints(0);
      setDisplayName('');
    }
  }, [isConnected, address, refetchPoints, refetchName, refetchWupBalance, refetchClaimedPoints, setUserPoints, setDisplayName]);

  useEffect(() => {
    if (pointsData !== undefined) {
      setUserPoints(Number(pointsData));
    }
  }, [pointsData, setUserPoints]);

  useEffect(() => {
    if (nameData) {
      setDisplayName(nameData);
    }
  }, [nameData, setDisplayName]);

  const fetchUserFromDb = async (walletAddress) => {
    try {
      const response = await axios.get(`${API_BASE}/users/${walletAddress}`);
      if (response.data && response.data.displayName) {
        if (!nameData) {
          setDisplayName(response.data.displayName);
        }
      }
    } catch (error) {
      console.log('User not found in DB or error:', error.message);
    }
  };

  const saveDisplayNameToDb = async (name, walletAddress) => {
    try {
      setSavingToDb(true);
      const response = await axios.post(`${API_BASE}/users/set-display-name`, {
        walletAddress,
        displayName: name
      });
      if (response.data.success) return true;
      return false;
    } catch (error) {
      console.error('Failed to save display name to database:', error);
      return false;
    } finally {
      setSavingToDb(false);
    }
  };

  useEffect(() => {
    const handleTransactionFlow = async () => {
      if (isPending) toast.loading("Confirm transaction in wallet...", { id: "setNameToast" });
      if (isConfirming) toast.loading("Setting name on blockchain...", { id: "setNameToast" });
      if (isConfirmed) {
        toast.loading("Saving to database...", { id: "setNameToast" });
        const dbSaved = await saveDisplayNameToDb(newName, address);
        if (dbSaved) {
          toast.success("Name saved successfully!", { id: "setNameToast" });
          setDisplayName(newName);
          setNewName("");
          refetchName();
        }
      }
      if (isWriteError || isReceiptError) {
        const errorMsg = writeError?.shortMessage || receiptError?.shortMessage || "Transaction failed";
        toast.error(`Error: ${errorMsg}`, { id: "setNameToast" });
      }
    };
    handleTransactionFlow();
  }, [isPending, isConfirming, isConfirmed, newName, address, setDisplayName, refetchName, isWriteError, writeError, isReceiptError, receiptError]);

  const handleClaim = async () => {

    if (!currentClaimerAddress) {
    toast.error('Claiming is not supported on this network!');
    return;
  }
    if (claimablePoints <= 0) {
      toast.error('You have no points to claim!');
      return;
    }
    
    toast.loading('Confirm in your wallet...', { id: 'claim_toast' });

    claimRewards({
      address: currentClaimerAddress,
      abi: WUP_CLAIMER_ABI,
      functionName: 'claimReward',
      args: [],
    });
  };

  useEffect(() => {
    if (isConfirmingClaim) toast.loading('Claiming tokens...', { id: 'claim_toast' });
    if (isClaimConfirmed) {
      toast.success('Tokens Claimed!', { id: 'claim_toast' });
      refetchWupBalance();
      refetchClaimedPoints();
      refetchPoints();
    }
  }, [isConfirmingClaim, isClaimConfirmed, refetchWupBalance, refetchClaimedPoints, refetchPoints]);
  const handleWalletAction = () => {
    if (isConnected) disconnect();
    else open(); 
  };

  const handleSetDisplayName = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (newName.trim().length > 32) {
      toast.error("Name must be 1-32 characters");
      return;
    }
    writeContract({
      address: currentContractAddress,
      abi: WRAPUP_ABI,
      functionName: 'setDisplayName',
      args: [newName.trim()],
    });
  };

  // NEW: Disable button if they have no NEW points to claim
  const isClaimButtonDisabled = isClaiming || isConfirmingClaim || claimablePoints <= 0;
   
  const claimButtonText = () => {
    if (isClaiming) return 'Check Wallet...';
    if (isConfirmingClaim) return 'Confirming...';
    if (claimablePoints <= 0) return 'No Points';
    return 'Claim $WUP'; // Changed to WUP
  };

  return (
    <nav className="bg-[#09090b]/80 border-b border-[#27272a] sticky top-0 z-50 backdrop-blur-md supports-[backdrop-filter]:bg-[#09090b]/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-180 bg-black">
              <img src="/logo.png" alt="logo" width={40} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Wrap-Up
            </span>
          </Link>
           
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-[#27272a] text-zinc-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Desktop Navigation links — replace the existing link group */}
          <Link
            to="/research-list"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isActive('/research-list') ? 'text-[#10b981]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            Research
          </Link>

          <Link
            to="/curated"
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isActive('/curated') ? 'text-[#10b981]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Articles
          </Link>
            
            {isConnected && (
              <div className="flex items-center gap-4 pl-4 border-l border-[#27272a]">
                <div className="flex items-center gap-4 bg-[#121214] border border-[#27272a] rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#10b981]" />
                    <span className="text-white text-sm font-bold">{userPoints}</span>
                  </div>
                  <div className="w-px h-4 bg-[#27272a]"></div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#10b981]" />
                    <span className="text-white text-sm font-bold">
                        {wupBalance !== undefined ? (Number(wupBalance) / 1e18).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleClaim}
                  disabled={isClaimButtonDisabled}
                  className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${
                    isClaimButtonDisabled
                      ? 'bg-[#18181b] text-zinc-600 cursor-not-allowed border border-[#27272a]'
                      : 'bg-[#10b981] text-black hover:bg-[#059669] hover:text-white'
                  }`}
                >
                  {claimButtonText()}
                </button>

                {displayName ? (
                  <div className="flex items-center gap-2 bg-[#121214] border border-[#27272a] px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full"></div>
                    <span className="text-sm font-medium text-white">{displayName}</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSetDisplayName()}
                      className="px-3 py-2 rounded-lg bg-[#121214] border border-[#27272a] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981] text-sm w-32"
                      disabled={isPending || isConfirming || savingToDb}
                    />
                    <button
                      onClick={handleSetDisplayName}
                      disabled={isPending || isConfirming || savingToDb}
                      className="bg-[#27272a] hover:bg-[#3f3f46] px-3 py-2 rounded-lg text-white"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Add the network switcher here so it only shows when connected */}
            {isConnected && <w3m-network-button />}
            
            <button
              onClick={handleWalletAction}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ml-2 ${
                isConnected
                  ? 'bg-transparent border-[#27272a] text-white hover:border-red-500 hover:text-red-500' 
                  : 'bg-white border-white text-black hover:bg-zinc-200'
              }`}
            >
              {!isConnected && <Link2 className="w-4 h-4" />}
              {isConnected 
                ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` 
                : 'Connect Wallet'
              }
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-6 pt-4 space-y-4 border-t border-[#27272a]">
            <Link 
              to="/research-list" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-3 mx-3 rounded-lg text-base font-medium transition-all ${
                isActive('/research-list') ? 'bg-[#18181b] text-[#10b981]' : 'text-zinc-400 hover:bg-[#18181b] hover:text-white'
              }`}
            >
              <Brain className="w-5 h-5" />
              Research
            </Link>

            <Link 
              to="/curated" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-3 mx-3 rounded-lg text-base font-medium transition-all ${
                isActive('/curated') ? 'bg-[#18181b] text-[#10b981]' : 'text-zinc-400 hover:bg-[#18181b] hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" />
              Curated Articles
            </Link>
            
            {isConnected && (
              <div className="space-y-4 px-3 border-t border-[#27272a] pt-4 mx-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#121214] p-3 rounded-lg border border-[#27272a] flex items-center justify-between">
                        <span className="text-zinc-500 text-xs uppercase">Points</span>
                        <span className="text-[#10b981] font-bold">{userPoints}</span>
                    </div>
                    <div className="bg-[#121214] p-3 rounded-lg border border-[#27272a] flex items-center justify-between">
                        <span className="text-zinc-500 text-xs uppercase">$WUP</span>
                        <span className="text-[#10b981] font-bold">
                            {wupBalance !== undefined ? (Number(wupBalance) / 1e18).toFixed(2) : '0.00'}
                        </span>
                    </div>
                </div>

                <button
                  onClick={handleClaim}
                  disabled={isClaimButtonDisabled}
                  className={`w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wide ${
                    isClaimButtonDisabled
                      ? 'bg-[#18181b] text-zinc-600 border border-[#27272a]'
                      : 'bg-[#10b981] text-black hover:bg-[#059669]'
                  }`}
                >
                  {claimButtonText()}
                </button>

                {displayName ? (
                  <div className="flex items-center gap-2 bg-[#121214] border border-[#27272a] px-4 py-3 rounded-lg">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full"></div>
                    <span className="text-sm font-medium text-white">{displayName}</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Set Display Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#121214] border border-[#27272a] text-white focus:outline-none focus:border-[#10b981]"
                      disabled={isPending || isConfirming || savingToDb}
                    />
                    <button 
                      onClick={handleSetDisplayName} 
                      disabled={isPending || isConfirming || savingToDb} 
                      className="bg-[#27272a] hover:bg-[#3f3f46] px-4 rounded-lg text-white"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={() => {
                handleWalletAction();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full max-w-[calc(100%-1.5rem)] mx-3 mt-2 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${
                isConnected
                  ? 'bg-[#18181b] text-white border border-[#27272a] hover:border-red-500 hover:text-red-500' 
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {isConnected ? (
                <>
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}