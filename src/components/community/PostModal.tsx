import { useState, FormEvent } from "react";
<<<<<<< HEAD
import { createPost } from "@/lib/api";
=======
import { createCommunityPost } from "@/lib/db";
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostModal({ isOpen, onClose }: PostModalProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPosting(true);
    try {
      const user = auth.currentUser;
<<<<<<< HEAD
      await createPost({
        content,
        authorName: user?.displayName || "Anonymous",
        authorAvatar: user?.photoURL || "https://i.pravatar.cc/150?u=anon"
      });
=======
      await createCommunityPost(content, user?.displayName || "Anonymous", user?.photoURL || "https://i.pravatar.cc/150?u=anon");
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
      toast.success("Post created successfully!");
      setContent("");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-800 relative z-10 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create Post</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm outline-none focus:border-blue-500 dark:text-white resize-none h-32"
                required
              />
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isPosting || !content.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  {isPosting ? "Posting..." : "Post"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

