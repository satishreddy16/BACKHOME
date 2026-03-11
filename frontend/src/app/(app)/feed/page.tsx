"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { PostCard } from "@/components/post-card";
import { Loader2, Send, Filter } from "lucide-react";

const postTypes = [
  { value: "", label: "All" },
  { value: "UPDATE", label: "Updates" },
  { value: "HELP_REQUEST", label: "Help Needed" },
  { value: "JOB_REFERRAL", label: "Job Referrals" },
  { value: "HOUSING", label: "Housing" },
  { value: "EVENT_ANNOUNCEMENT", label: "Events" },
];

export default function FeedPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  // New post form
  const [showForm, setShowForm] = useState(false);
  const [newBody, setNewBody] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("UPDATE");
  const [posting, setPosting] = useState(false);

  const loadPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { city: user.currentCity };
      if (filter) params.type = filter;
      const res = await api.getPosts(params);
      setPosts(res.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [user, filter]);

  const handlePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newBody.trim()) return;
    setPosting(true);
    try {
      const post = await api.createPost({
        type: newType,
        title: newTitle || undefined,
        body: newBody,
        city: user.currentCity,
      });
      setPosts([post, ...posts]);
      setNewBody("");
      setNewTitle("");
      setNewType("UPDATE");
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Community Feed</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? "Cancel" : "New Post"}
        </button>
      </div>

      {/* New post form */}
      {showForm && (
        <form onSubmit={handlePost} className="card p-5 space-y-3">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="input text-sm"
          >
            {postTypes.filter((t) => t.value).map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Title (optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <textarea
            className="input min-h-[100px] resize-none"
            placeholder="What's on your mind?"
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            required
          />

          <button type="submit" disabled={posting} className="btn-primary text-sm flex items-center gap-2">
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Post
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-surface-900/40 dark:text-surface-50/40 flex-shrink-0" />
        {postTypes.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`text-sm px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              filter === t.value
                ? "bg-brand-500 text-white"
                : "bg-surface-200/50 dark:bg-surface-800/50 hover:bg-surface-200 dark:hover:bg-surface-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center text-surface-900/50 dark:text-surface-50/50">
          <p>No posts yet. Start the conversation!</p>
        </div>
      )}
    </div>
  );
}
