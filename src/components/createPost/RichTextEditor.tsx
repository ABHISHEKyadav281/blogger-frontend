import React, { useState, useRef, useEffect } from 'react';
import { 
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
  X,
  FileText,
  Settings,
  Clock,
} from 'lucide-react';

// Utility functions for Markdown conversion
const markdownToHtml = (md: string) => {
  if (!md) return '';
  return md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .split('\n').join('<br/>');
};

const htmlToMarkdown = (html: string) => {
  return html
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<i>(.*?)<\/i>/g, '*$1*')
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    .replace(/<h2.*?>(.*?)<\/h2>/g, '## $1\n')
    .replace(/<blockquote.*?>(.*?)<\/blockquote>/g, '> $1\n')
    .replace(/<li.*?>(.*?)<\/li>/g, '- $1\n')
    .replace(/<br.*?>/g, '\n')
    .replace(/<div.*?>(.*?)<\/div>/g, '\n$1')
    .replace(/<p.*?>(.*?)<\/p>/g, '\n$1\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\n+/g, '\n\n')
    .trim();
};

const RichTextEditor: React.FC<{
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}> = ({ content, onChange, placeholder = "Start writing your blog..." }) => {
  const [showToolbar, setShowToolbar] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef(content);

  useEffect(() => {
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.max(1, Math.ceil(words / 200)));
    
    // Update editor content if it changes externally
    if (editorRef.current && content !== lastContentRef.current) {
      editorRef.current.innerHTML = markdownToHtml(content);
      lastContentRef.current = content;
    }
  }, [content]);

  // Initial load
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = markdownToHtml(content);
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const markdown = htmlToMarkdown(html);
      lastContentRef.current = markdown;
      onChange(markdown);
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const toolbarActions = [
    { icon: Bold, action: () => execCommand('bold'), title: 'Bold' },
    { icon: Italic, action: () => execCommand('italic'), title: 'Italic' },
    { icon: Underline, action: () => execCommand('underline'), title: 'Underline' },
    { icon: Hash, action: () => execCommand('formatBlock', 'h2'), title: 'Heading' },
    { icon: List, action: () => execCommand('insertUnorderedList'), title: 'List' },
    { icon: Quote, action: () => execCommand('formatBlock', 'blockquote'), title: 'Quote' },
    { icon: Code, action: () => execCommand('formatBlock', 'pre'), title: 'Code' },
    { icon: Link, action: () => {
      const url = prompt('Enter URL:');
      if (url) execCommand('createLink', url);
    }, title: 'Link' }
  ];

  return (
    <div className="bg-white/5 border border-white/20 rounded-2xl overflow-hidden relative min-h-[500px] transition-all group-focus-within:border-primary/50 group-focus-within:bg-white/10">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            {toolbarActions.map((tool, index) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); tool.action(); }}
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
            <span className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>{wordCount} words</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </span>
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
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="w-full min-h-[400px] p-8 text-white placeholder-gray-500 focus:outline-none leading-relaxed prose prose-invert prose-pink max-w-none"
          style={{ 
            lineHeight: '1.8',
            outline: 'none'
          }}
          data-placeholder={placeholder}
        />
        
        {/* Placeholder - manually handled for contentEditable */}
        {!content && (
          <div className="absolute top-8 left-8 text-gray-500 pointer-events-none italic">
            {placeholder}
          </div>
        )}

        {/* Character limit indicator */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-black/30 px-2 py-1 rounded-full border border-white/10">
          {content.length}/10000
        </div>
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          font-style: italic;
        }
        .prose blockquote {
          border-left: 4px solid #ec4899;
          padding-left: 1rem;
          font-style: italic;
          color: #d1d5db;
        }
        .prose h2 {
          color: white;
          font-weight: 700;
          font-size: 1.5rem;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        .prose li {
          color: #d1d5db;
        }
        .prose code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          color: #f472b6;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;