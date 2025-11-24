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
// Media Upload Component
const MediaUpload: React.FC<{
  onUpload: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
}> = ({ onUpload, accept = "image/*,video/*", multiple = true }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
        dragOver 
          ? 'border-pink-400 bg-pink-500/10' 
          : 'border-white/20 hover:border-white/40 hover:bg-white/5'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => {e.preventDefault(); setDragOver(true);}}
      onDragLeave={() => setDragOver(false)}
    >
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">Upload Media</h3>
      <p className="text-gray-400 mb-4">Drag & drop images or videos, or click to browse</p>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
      >
        Choose Files
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default MediaUpload;