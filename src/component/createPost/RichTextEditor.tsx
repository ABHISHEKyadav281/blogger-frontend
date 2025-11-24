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

const RichTextEditor: React.FC<{
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}> = ({ content, onChange, placeholder = "Start writing your anime blog post..." }) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showToolbar, setShowToolbar] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.max(1, Math.ceil(words / 200))); // Average reading speed
  }, [content]);

  const insertText = (before: string, after: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const toolbarActions = [
    { icon: Bold, action: () => insertText('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => insertText('*', '*'), title: 'Italic' },
    { icon: Underline, action: () => insertText('<u>', '</u>'), title: 'Underline' },
    { icon: Hash, action: () => insertText('\n## '), title: 'Heading' },
    { icon: List, action: () => insertText('\n- '), title: 'List' },
    { icon: Quote, action: () => insertText('\n> '), title: 'Quote' },
    { icon: Code, action: () => insertText('`', '`'), title: 'Code' },
    { icon: Link, action: () => insertText('[', '](url)'), title: 'Link' }
  ];

  return (
    <div className="bg-white/5 border border-white/20 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-2">
            {toolbarActions.map((tool, index) => (
              <button
                key={index}
                onClick={tool.action}
                title={tool.title}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <tool.icon className="w-4 h-4" />
              </button>
            ))}
            <div className="h-4 w-px bg-white/20 mx-2" />
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <Image className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <Smile className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>{wordCount} words</span>
            <span>{readingTime} min read</span>
            <button
              onClick={() => setShowToolbar(false)}
              className="p-1 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!showToolbar && (
        <button
          onClick={() => setShowToolbar(true)}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={editorRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-96 p-6 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none font-mono leading-relaxed"
          style={{ lineHeight: '1.8' }}
        />
        
        {/* Character limit indicator */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-black/30 px-2 py-1 rounded">
          {content.length}/10000
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;