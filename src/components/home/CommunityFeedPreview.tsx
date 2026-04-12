import { useState, useEffect } from "react";
import { ThumbsUp, MessageCircle, ArrowRight } from "lucide-react";
import { getCommunityPosts } from "@/lib/db";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function CommunityFeedPreview() {
  const [posts, setPosts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCommunityPosts().then(setPosts).catch(console.error);
  }, []);

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 h-full transition-colors duration-300 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Community Feed</h2>
      </div>

      <div className="space-y-4 flex-1">
        {posts.slice(0, 2).map((post) => (
          <div
            key={post.id}
            className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-4 last:pb-0"
          >
            <div className="flex items-center gap-2 mb-2">
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  {post.authorName}
                  <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400">
                    • {post.time}
                  </span>
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3 break-words whitespace-normal overflow-hidden">
              {post.content}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">
                  <ThumbsUp className="w-4 h-4" /> {post.likesCount || 0}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-4 h-4" /> {post.comments || 0}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <motion.button 
        whileHover={{ scale: 1.02, x: 5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/community")}
        className="mt-4 w-full py-2.5 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-100 dark:border-gray-800"
      >
        Show more <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}

