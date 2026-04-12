import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Search,
  ThumbsUp,
  MessageCircle,
  Edit3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { getCommunityPosts, likePost, replyPost } from "@/lib/db";
import PostModal from "@/components/community/PostModal";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("For You");
  const [posts, setPosts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const tabs = ["For You", "Following", "Clubs"];

  const loadPosts = async () => {
    try {
      const data = await getCommunityPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error loading community posts:", error);
      toast.error("Failed to load community feed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReply = async (postId: string) => {
    const content = prompt("Enter your reply:");
    if (!content) return;
    
    try {
      await replyPost(postId, content, auth.currentUser?.displayName || "Anonymous", auth.currentUser?.photoURL || "");
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p));
      toast.success("Reply added!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-[#0B1120] min-h-full relative pb-20 md:pb-0 transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#0B1120] z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-600 dark:text-gray-400"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white ml-2">Community</h1>
      </div>

      <div className="p-4 md:p-8">
        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search discussions..."
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/20 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all dark:text-gray-100"
          />
        </motion.div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
          {tabs.map((tab, idx) => (
            <motion.button
              key={tab}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-6 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            ) : posts.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500 dark:text-gray-400"
              >
                No posts yet. Be the first to share something!
              </motion.div>
            ) : (
              posts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0 overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={post.authorAvatar || "https://i.pravatar.cc/150?u=anon"}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1 truncate">
                        {post.authorName}
                        <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400 shrink-0">
                          • {post.time}
                        </span>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-4 leading-relaxed break-words whitespace-normal overflow-hidden line-clamp-3">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <ThumbsUp className="w-5 h-5" /> {post.likesCount || 0}
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReply(post.id)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" /> {post.comments || 0}
                      </motion.button>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReply(post.id)}
                      className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-900 px-4 py-1.5 rounded-lg shrink-0"
                    >
                      Reply
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none z-20"
      >
        <Edit3 className="w-6 h-6" />
      </motion.button>

      <PostModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          loadPosts();
        }} 
      />
    </div>
  );
}

