"use client";

import { Avatar } from "./avatar";
import { timeAgo } from "@/lib/utils";
import { MessageCircle, MapPin, Briefcase, Home, HelpCircle, Calendar } from "lucide-react";

const typeConfig: Record<string, { label: string; color: string; icon: any }> = {
  UPDATE: { label: "Update", color: "badge-brand", icon: null },
  HELP_REQUEST: { label: "Help Needed", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300", icon: HelpCircle },
  JOB_REFERRAL: { label: "Job Referral", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300", icon: Briefcase },
  EVENT_ANNOUNCEMENT: { label: "Event", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300", icon: Calendar },
  HOUSING: { label: "Housing", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300", icon: Home },
};

interface PostCardProps {
  post: {
    id: string;
    type: string;
    title?: string;
    body: string;
    city: string;
    tags: string[];
    createdAt: string;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      verifiedBadge?: boolean;
    };
    _count?: { comments: number };
  };
  onClick?: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  const config = typeConfig[post.type] || typeConfig.UPDATE;
  const TypeIcon = config.icon;

  return (
    <div onClick={onClick} className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start gap-3">
        <Avatar
          src={post.author.avatarUrl}
          firstName={post.author.firstName}
          lastName={post.author.lastName}
          size="md"
          verified={post.author.verifiedBadge}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">
              {post.author.firstName} {post.author.lastName}
            </span>
            <span className="text-xs text-surface-900/40 dark:text-surface-50/40">
              {timeAgo(post.createdAt)}
            </span>
            {post.type !== "UPDATE" && (
              <span className={`badge text-xs ${config.color}`}>
                {TypeIcon && <TypeIcon className="h-3 w-3 mr-1" />}
                {config.label}
              </span>
            )}
          </div>

          {post.title && <h3 className="font-semibold mt-1">{post.title}</h3>}

          <p className="text-sm text-surface-900/70 dark:text-surface-50/70 mt-1 line-clamp-3">
            {post.body}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-surface-900/50 dark:text-surface-50/50">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {post.city}
            </span>
            {(post._count?.comments ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {post._count!.comments}
              </span>
            )}
            {post.tags.length > 0 && (
              <div className="flex gap-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-brand-500">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
