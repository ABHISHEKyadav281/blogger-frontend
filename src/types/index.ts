export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  isVerified: boolean;
  role: 'admin' | 'moderator' | 'verified' | 'user';
  bio?: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  followers?: number; // Added from new API response
  isSubscribed?: boolean;
}

export interface BlogPost {
  commentsCount: number;
  likesCount: number;
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: User;
  createdAt: string;
  readTime: string;
  category: string;
  tags: string[];
  coverImage: string;
  stats: {
    likes: number;
    comments: number;
  };
  viewsCount: number;
  isBookmarked: boolean;
  isLiked: boolean;
  isDisliked: boolean;
  dislikesCount: number;
  subscribed?: boolean; // Added from new API response
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  parentId?: string;
}

export interface Notification {
  id: string | number;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'info';
  message: string | null;
  read: boolean;
  postId?: string | number;
  // Backend specific / legacy fields
  authorName?: string;
  from?: string;
  avatar?: string;
  createdAt?: string;
  timestamp?: string;
  userId?: string | number;
}

export interface Post {
  id?: string;          // optional because backend usually generates this
  title: string;
  content: string;
  mediaUrl?: string;    // uploaded image/video
  authorId: string;     // from JWT or Redux auth state
  tags?: string[];
  category?: string;
  status?: "draft" | "published";
  createdAt?: string;
  updatedAt?: string;
}
