
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
const PostPreview: React.FC<{ postData: PostData }> = ({ postData }) => {
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold text-white mb-4">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-white mb-3">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('> ')) {
          return <blockquote key={index} className="border-l-4 border-primary pl-4 text-gray-300 italic mb-4">{line.replace('> ', '')}</blockquote>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="text-gray-300 mb-2 ml-4">{line.replace('- ', '')}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        // Handle inline formatting
        let formatted = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded">$1</code>');
        
        return <p key={index} className="text-gray-300 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
      });
  };

  const selectedCategory = categories.find(cat => cat.id === postData.category);

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
      {/* Cover Image */}
      {postData.coverImage && (
        <div className="relative h-64 overflow-hidden">
          <img src={postData.coverImage} alt={postData.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4">
            {selectedCategory && (
              <span className={`px-3 py-1 bg-gradient-to-r ${selectedCategory.color} text-white text-sm font-medium rounded-full`}>
                {selectedCategory.name}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-6 md:p-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
          {postData.title || 'Your Post Title'}
        </h1>

        {/* Excerpt */}
        {postData.excerpt && (
          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            {postData.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-400">
          <span className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{Math.max(1, Math.ceil(postData.content.split(' ').length / 200))} min read</span>
          </span>
          <span className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>Preview Mode</span>
          </span>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-8">
          {postData.content ? formatContent(postData.content) : (
            <p className="text-gray-500 italic">Start writing to see your content preview...</p>
          )}
        </div>

        {/* Tags */}
        {postData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {postData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/10 text-gray-400 rounded-full text-sm flex items-center space-x-1"
              >
                <Tag className="w-3 h-3" />
                <span>#{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPreview;