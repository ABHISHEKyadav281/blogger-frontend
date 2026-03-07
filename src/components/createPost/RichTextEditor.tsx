import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Type,
} from 'lucide-react';

interface ToolbarPosition {
  top: number;
  left: number;
}

const RichTextEditor: React.FC<{
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}> = ({ content, onChange, placeholder = "Tell your Anime experience..." }) => {
  const [toolbarPos, setToolbarPos] = useState<ToolbarPosition | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Sync content with editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      // Only update if the content is truly different (e.g., external change)
      // This prevents the cursor jump during typing because innerHTML matches state exactly
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  // Handle initial mount separately to ensure it's set once
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content || '';
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const updateToolbarPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setToolbarPos(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();

    if (editorRect) {
      setToolbarPos({
        top: rect.top - editorRect.top - 50, // Position above the text
        left: rect.left - editorRect.left + rect.width / 2
      });
    }
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(updateToolbarPosition, 10);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleMouseUp);
    };
  }, [updateToolbarPosition]);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleInput();
    // Re-check selection to keep toolbar visible if needed
    setTimeout(updateToolbarPosition, 10);
  };

  const toolbarActions = [
    { icon: Bold, action: () => execCommand('bold'), title: 'Bold' },
    { icon: Italic, action: () => execCommand('italic'), title: 'Italic' },
    { icon: Type, action: () => execCommand('formatBlock', 'h2'), title: 'Heading' },
    { icon: Quote, action: () => execCommand('formatBlock', 'blockquote'), title: 'Quote' },
    { icon: List, action: () => execCommand('insertUnorderedList'), title: 'List' },
    { icon: Link, action: () => {
      const url = prompt('Enter URL:');
      if (url) execCommand('createLink', url);
    }, title: 'Link' }
  ];

  return (
    <div className="relative group max-w-3xl mx-auto">
      {/* Floating Toolbar */}
      {toolbarPos && (
        <div 
          ref={toolbarRef}
          style={{ 
            top: `${toolbarPos.top}px`, 
            left: `${toolbarPos.left}px`,
            transform: 'translateX(-50%)'
          }}
          className="absolute z-50 flex items-center bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-1 animate-in fade-in zoom-in duration-200"
        >
          <div className="flex items-center space-x-1">
            {toolbarActions.map((tool, index) => (
              <button
                key={index}
                onMouseDown={(e) => { e.preventDefault(); tool.action(); }}
                title={tool.title}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
              >
                <tool.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-800 rotate-45" />
        </div>
      )}

      {/* Main Editor */}
      <div 
        className="prose prose-invert prose-lg max-w-none min-h-[500px] focus:outline-none selection:bg-pink-500/30"
        style={{ caretColor: '#ec4899' }}
      >
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full text-white/90 leading-relaxed font-serif"
          style={{ 
            outline: 'none',
            fontSize: '1.25rem'
          }}
        />
        
        {/* Placeholder logic for contentEditable */}
        {!content && (
           <div className="absolute top-0 left-0 text-white/30 pointer-events-none text-xl font-serif italic">
             {placeholder}
           </div>
        )}
      </div>

      <style>{`
        .prose h2 {
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 1.875rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: white;
          font-weight: 700;
        }
        .prose blockquote {
          border-left: 3px solid white;
          padding-left: 1.5rem;
          font-style: italic;
          color: #d1d5db;
          margin: 2rem 0;
        }
        .prose p {
          margin: 1.5rem 0;
        }
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1.5rem 0;
        }
        .prose a {
          color: #ec4899;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
