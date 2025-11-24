import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Send, 
  Image, 
  Video, 
  Link, 
  Bold, 
  Italic, 
  Underline,
  List,
  Hash,
  Quote,
  Code,
  Smile,
  Tag,
  Calendar,
  Clock,
  Globe,
  Lock,
  Users,
  AlertCircle,
  X,
  Upload,
  FileText,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface PostData {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  visibility: 'public' | 'private' | 'followers';
  publishDate?: string;
  allowComments: boolean;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  size: number;
}

const categories: Category[] = [
  { id: '1', name: 'Anime Reviews', description: 'In-depth anime series and movie reviews', color: 'from-pink-500 to-red-500' },
  { id: '2', name: 'Manga Discussion', description: 'Manga analysis and discussions', color: 'from-blue-500 to-cyan-500' },
  { id: '3', name: 'Character Analysis', description: 'Deep dives into character development', color: 'from-purple-500 to-violet-500' },
  { id: '4', name: 'Industry News', description: 'Latest anime industry updates', color: 'from-green-500 to-emerald-500' },
  { id: '5', name: 'Studio Spotlights', description: 'Focusing on animation studios', color: 'from-yellow-500 to-orange-500' },
  { id: '6', name: 'Technical Analysis', description: 'Animation and production breakdowns', color: 'from-indigo-500 to-blue-600' }
];

const popularTags = [
  'AttackOnTitan', 'OnePiece', 'DemonSlayer', 'JujutsuKaisen', 'MyHeroAcademia',
  'Naruto', 'DragonBall', 'StudioGhibli', 'MAPPA', 'WITStudio', 'Toei',
  'Shonen', 'Seinen', 'Shoujo', 'Isekai', 'Mecha', 'Romance', 'Action',
  'Comedy', 'Drama', 'Thriller', 'Horror', 'Slice of Life'
];

const PostEditor = ({ postData, setPostData }) => {
  return (
    <textarea
      value={postData.content}
      onChange={(e) => setPostData({ ...postData, content: e.target.value })}
      className="w-full h-60 border rounded p-2"
      placeholder="Write your post..."
    />
  );
};

export default PostEditor;
