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
  isSubscribed?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: User;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  coverImage: string;
  stats: {
    likes: number;
    comments: number;
    views: number;
    isLiked: boolean;
    isBookmarked: boolean;
  };
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
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  from: string;
  avatar: string;
  message: string;
  timestamp: string;
  read: boolean;
  postId?: string;
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
