import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  MoreHorizontal, 
  Flag, 
  Edit3, 
  Trash2, 
  Pin, 
  Award,
  ChevronDown,
  ChevronUp,
  Smile,
  Image,
  AtSign,
  Reply,
  Clock,
  Check,
  X,
  AlertCircle,
  ThumbsDown
} from 'lucide-react';

// Types
interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role?: 'admin' | 'moderator' | 'verified' | 'user';
}

interface Comment {
  id: string;
  content: string;
  author: User;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  isPinned?: boolean;
  isHighlighted?: boolean;
  replies?: Comment[];
  mentions?: User[];
  images?: string[];
  parentId?: string;
}

interface CommentSystemProps {
  postId: string;
  currentUser: User;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string, mentions?: User[]) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
  onDislikeComment: (commentId: string) => void;
  onPinComment?: (commentId: string) => void;
  onReportComment?: (commentId: string, reason: string) => void;
  allowImages?: boolean;
  allowMentions?: boolean;
  maxDepth?: number;
  sortBy?: 'newest' | 'oldest' | 'popular';
}

// Sample Data
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'OtakuMaster99',
    username: 'otakumaster99',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    role: 'verified'
  },
  {
    id: '2',
    name: 'AnimeLover2024',
    username: 'animelover2024',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b152bbef?w=40&h=40&fit=crop&crop=face',
    role: 'user'
  },
  {
    id: '3',
    name: 'ModeratorSan',
    username: 'moderatorsan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    role: 'moderator'
  }
];

const currentUser: User = {
  id: 'current',
  name: 'You',
  username: 'yourname',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
  role: 'user'
};

// Comment Item Component
const CommentItem: React.FC<{
  comment: Comment;
  currentUser: User;
  depth: number;
  maxDepth: number;
  onReply: (parentId: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
  onPin?: (commentId: string) => void;
  onReport?: (commentId: string, reason: string) => void;
}> = ({ 
  comment, 
  currentUser, 
  depth, 
  maxDepth, 
  onReply, 
  onEdit, 
  onDelete, 
  onLike, 
  onDislike,
  onPin,
  onReport
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = comment.author.id === currentUser.id;
  const canModerate = currentUser.role === 'admin' || currentUser.role === 'moderator';

  const handleEdit = () => {
    onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  const handleReport = (reason: string) => {
    onReport?.(comment.id, reason);
    setShowReportMenu(false);
    setShowActions(false);
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin':
        return <Award className="w-4 h-4 text-yellow-400" title="Admin" />;
      case 'moderator':
        return <Award className="w-4 h-4 text-blue-400" title="Moderator" />;
      case 'verified':
        return <Check className="w-4 h-4 text-green-400" title="Verified" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    // Simple time formatting - you can replace with your preferred library
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffMs = now.getTime() - commentTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'just now';
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mb-6'}`}>
      <div className={`flex space-x-3 ${comment.isPinned ? 'bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4' : ''}`}>
        {/* Avatar */}
        <div className="relative">
          <img 
            src={comment.author.avatar} 
            alt={comment.author.name}
            className="w-10 h-10 rounded-full border-2 border-white/20"
          />
          {comment.author.role && (
            <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1">
              {getRoleIcon(comment.author.role)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="font-semibold text-white truncate">{comment.author.name}</span>
              <span className="text-gray-400 text-sm">@{comment.author.username}</span>
              <span className="text-gray-500 text-sm flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(comment.timestamp)}</span>
              </span>
              {comment.edited && (
                <span className="text-gray-500 text-xs bg-white/10 px-2 py-1 rounded-full">
                  edited
                </span>
              )}
              {comment.isPinned && (
                <div className="flex items-center space-x-1 text-yellow-400 text-xs">
                  <Pin className="w-3 h-3" />
                  <span>Pinned</span>
                </div>
              )}
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-8 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl py-2 min-w-48 z-10">
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {setIsEditing(true); setShowActions(false);}}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {onDelete(comment.id); setShowActions(false);}}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                  
                  {canModerate && !isOwner && (
                    <button
                      onClick={() => {onPin?.(comment.id); setShowActions(false);}}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-all"
                    >
                      <Pin className="w-4 h-4" />
                      <span>{comment.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                  )}

                  {!isOwner && (
                    <button
                      onClick={() => setShowReportMenu(true)}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Report</span>
                    </button>
                  )}
                </div>
              )}

              {/* Report Menu */}
              {showReportMenu && (
                <div className="absolute right-0 top-8 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl py-2 min-w-56 z-20">
                  <div className="px-4 py-2 text-white font-medium border-b border-white/10">
                    Report Comment
                  </div>
                  {['Spam', 'Harassment', 'Inappropriate Content', 'Misinformation', 'Other'].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => handleReport(reason)}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {reason}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowReportMenu(false)}
                    className="w-full text-left px-4 py-2 text-gray-500 hover:text-gray-400 transition-all border-t border-white/10 mt-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={`${comment.isHighlighted ? 'bg-pink-500/10 border-l-4 border-pink-500 pl-4' : ''}`}>
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 resize-none"
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {setIsEditing(false); setEditContent(comment.content);}}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 leading-relaxed mb-3">{comment.content}</p>
            )}
          </div>

          {/* Images */}
          {comment.images && comment.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3 max-w-md">
              {comment.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Comment attachment ${index + 1}`}
                  className="rounded-lg border border-white/20 cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Like/Dislike */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onLike(comment.id)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all ${
                    comment.isLiked 
                      ? 'text-red-400 bg-red-500/20' 
                      : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{comment.likes}</span>
                </button>

                <button
                  onClick={() => onDislike(comment.id)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all ${
                    comment.isDisliked 
                      ? 'text-blue-400 bg-blue-500/20' 
                      : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                  }`}
                >
                  <ThumbsDown className={`w-4 h-4 ${comment.isDisliked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{comment.dislikes}</span>
                </button>
              </div>

              {/* Reply */}
              {depth < maxDepth && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center space-x-1 px-2 py-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all text-sm"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              )}
            </div>

            {/* Toggle Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm"
              >
                {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
              </button>
            )}
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && showReplies && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onLike={onLike}
                  onDislike={onDislike}
                  onPin={onPin}
                  onReport={onReport}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Comment Composer Component
const CommentComposer: React.FC<{
  currentUser: User;
  onSubmit: (content: string, mentions?: User[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
  allowImages?: boolean;
  allowMentions?: boolean;
  isReply?: boolean;
  onCancel?: () => void;
}> = ({ 
  currentUser, 
  onSubmit, 
  placeholder = "Share your thoughts...", 
  autoFocus = false,
  allowImages = true,
  allowMentions = true,
  isReply = false,
  onCancel 
}) => {
  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<User[]>([]);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content, mentions);
      setContent('');
      setMentions([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const addMention = (user: User) => {
    if (!mentions.find(m => m.id === user.id)) {
      setMentions([...mentions, user]);
      setContent(content + `@${user.username} `);
    }
    setShowMentionMenu(false);
    setMentionQuery('');
  };

  return (
    <div className={`${isReply ? 'bg-white/5 rounded-2xl p-4 border border-white/10' : 'bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20'}`}>
      <div className="flex space-x-4">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full border-2 border-white/20 flex-shrink-0"
        />
        
        <div className="flex-1 space-y-3">
          {/* Mentions Display */}
          {mentions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mentions.map((user) => (
                <span
                  key={user.id}
                  className="flex items-center space-x-1 bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-sm"
                >
                  <AtSign className="w-3 h-3" />
                  <span>{user.username}</span>
                  <button
                    onClick={() => setMentions(mentions.filter(m => m.id !== user.id))}
                    className="text-pink-400 hover:text-pink-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Text Area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className={`w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white/10 resize-none transition-all duration-300 ${
                isReply ? 'min-h-20' : 'min-h-24'
              }`}
              rows={isReply ? 3 : 4}
            />
            
            {/* Character Count */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {content.length}/1000
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {allowImages && (
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <Image className="w-5 h-5" />
                </button>
              )}
              
              <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                <Smile className="w-5 h-5" />
              </button>
              
              {allowMentions && (
                <div className="relative">
                  <button 
                    onClick={() => setShowMentionMenu(!showMentionMenu)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <AtSign className="w-5 h-5" />
                  </button>
                  
                  {showMentionMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl py-2 min-w-48 max-h-48 overflow-y-auto z-10">
                      <div className="px-3 py-2 text-sm text-gray-400 border-b border-white/10">
                        Mention someone
                      </div>
                      {sampleUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => addMention(user)}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                          <div className="text-left">
                            <div className="text-sm">{user.name}</div>
                            <div className="text-xs text-gray-500">@{user.username}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {isReply && onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isReply ? 'Reply' : 'Comment'}</span>
              </button>
            </div>
          </div>
          
          {/* Help Text */}
          <div className="text-xs text-gray-500">
            Press Ctrl/Cmd + Enter to submit quickly
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Comment System Component
const AdvancedCommentSystem: React.FC<CommentSystemProps> = ({
  postId,
  currentUser,
  comments: initialComments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  onDislikeComment,
  onPinComment,
  onReportComment,
  allowImages = true,
  allowMentions = true,
  maxDepth = 3,
  sortBy = 'newest'
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'popular'>(sortBy);
  const [filter, setFilter] = useState<'all' | 'pinned' | 'highlighted'>('all');

  // Sample comments data
  const sampleComments: Comment[] = [
    {
      id: '1',
      content: 'This is an incredible analysis! The way you broke down the animation differences between WIT Studio and MAPPA really opened my eyes. I never noticed how the camera work evolved between seasons.',
      author: sampleUsers[0],
      timestamp: '2024-03-15T14:30:00Z',
      likes: 23,
      dislikes: 1,
      isLiked: true,
      isDisliked: false,
      isPinned: true,
      replies: [
        {
          id: '1-1',
          content: 'Totally agree! The technical breakdown was amazing. I work in animation and can confirm these observations are spot-on.',
          author: sampleUsers[2],
          timestamp: '2024-03-15T15:00:00Z',
          likes: 12,
          dislikes: 0,
          isLiked: false,
          isDisliked: false,
          parentId: '1'
        }
      ]
    },
    {
      id: '2',
      content: 'Great article! As someone who read the manga first, seeing these scenes animated was mind-blowing. Both studios brought something unique to the table. 🔥',
      author: sampleUsers[1],
      timestamp: '2024-03-15T13:45:00Z',
      likes: 67,
      dislikes: 3,
      isLiked: false,
      isDisliked: false,
      isHighlighted: true,
      replies: []
    }
  ];

  // Initialize with sample data
  useEffect(() => {
    setComments(sampleComments);
  }, []);

  const handleAddComment = (content: string, parentId?: string, mentions?: User[]) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: currentUser,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
      mentions,
      parentId,
      replies: []
    };

    if (parentId) {
      // Add as reply
      const addReplyToComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment]
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies)
            };
          }
          return comment;
        });
      };
      setComments(addReplyToComment(comments));
      setReplyingTo(null);
    } else {
      // Add as top-level comment
      setComments([newComment, ...comments]);
    }

    onAddComment(content, parentId, mentions);
  };

  const handleEditComment = (commentId: string, content: string) => {
    const updateComment = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            content,
            edited: true,
            editedAt: new Date().toISOString()
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateComment(comment.replies)
          };
        }
        return comment;
      });
    };
    setComments(updateComment(comments));
    onEditComment(commentId, content);
  };

  const handleDeleteComment = (commentId: string) => {
    const deleteComment = (comments: Comment[]): Comment[] => {
      return comments.filter(comment => {
        if (comment.id === commentId) return false;
        if (comment.replies) {
          comment.replies = deleteComment(comment.replies);
        }
        return true;
      });
    };
    setComments(deleteComment(comments));
    onDeleteComment(commentId);
  };

  const handleLikeComment = (commentId: string) => {
    const updateComment = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            isDisliked: comment.isLiked ? comment.isDisliked : false,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            dislikes: comment.isLiked ? comment.dislikes : (comment.isDisliked ? comment.dislikes - 1 : comment.dislikes)
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateComment(comment.replies)
          };
        }
        return comment;
      });
    };
    setComments(updateComment(comments));
    onLikeComment(commentId);
  };

  const handleDislikeComment = (commentId: string) => {
    const updateComment = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isDisliked: !comment.isDisliked,
            isLiked: comment.isDisliked ? comment.isLiked : false,
            dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes + 1,
            likes: comment.isDisliked ? comment.likes : (comment.isLiked ? comment.likes - 1 : comment.likes)
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateComment(comment.replies)
          };
        }
        return comment;
      });
    };
    setComments(updateComment(comments));
    onDislikeComment(commentId);
  };

  const handlePinComment = (commentId: string) => {
    const updateComment = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isPinned: !comment.isPinned
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateComment(comment.replies)
          };
        }
        return comment;
      });
    };
    setComments(updateComment(comments));
    onPinComment?.(commentId);
  };

  const handleReportComment = (commentId: string, reason: string) => {
    console.log(`Reported comment ${commentId} for: ${reason}`);
    onReportComment?.(commentId, reason);
    // You could show a toast notification here
  };

  // Sort comments
  const sortedComments = [...comments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    switch (sortOrder) {
      case 'oldest':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'popular':
        return (b.likes - b.dislikes) - (a.likes - a.dislikes);
      default: // newest
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  // Filter comments
  const filteredComments = sortedComments.filter(comment => {
    switch (filter) {
      case 'pinned':
        return comment.isPinned;
      case 'highlighted':
        return comment.isHighlighted;
      default:
        return true;
    }
  });

  const totalComments = comments.reduce((count, comment) => {
    return count + 1 + (comment.replies?.length || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-pink-400" />
            <span>Advanced Comment System</span>
          </h1>
          <p className="text-gray-400">
            A comprehensive comment system with replies, mentions, moderation, and more
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">
                {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}
              </span>
              
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Sort by:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'popular')}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-pink-400"
                >
                  <option value="newest" className="bg-gray-800">Newest</option>
                  <option value="oldest" className="bg-gray-800">Oldest</option>
                  <option value="popular" className="bg-gray-800">Popular</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Filter:</span>
              <div className="flex space-x-2">
                {(['all', 'pinned', 'highlighted'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1 text-sm rounded-full transition-all capitalize ${
                      filter === filterType
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    {filterType}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Comment */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Join the discussion</h2>
          <CommentComposer
            currentUser={currentUser}
            onSubmit={(content, mentions) => handleAddComment(content, undefined, mentions)}
            allowImages={allowImages}
            allowMentions={allowMentions}
          />
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {filteredComments.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No comments yet</h3>
              <p className="text-gray-400">
                {filter === 'all' 
                  ? "Be the first to share your thoughts!" 
                  : `No ${filter} comments found. Try changing the filter.`
                }
              </p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  currentUser={currentUser}
                  depth={0}
                  maxDepth={maxDepth}
                  onReply={setReplyingTo}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  onLike={handleLikeComment}
                  onDislike={handleDislikeComment}
                  onPin={handlePinComment}
                  onReport={handleReportComment}
                />
                
                {/* Reply Composer */}
                {replyingTo === comment.id && (
                  <div className="ml-8 mt-4">
                    <CommentComposer
                      currentUser={currentUser}
                      onSubmit={(content, mentions) => handleAddComment(content, comment.id, mentions)}
                      placeholder={`Reply to ${comment.author.name}...`}
                      autoFocus={true}
                      allowImages={allowImages}
                      allowMentions={allowMentions}
                      isReply={true}
                      onCancel={() => setReplyingTo(null)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredComments.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-semibold transition-all duration-300 hover:scale-105">
              Load More Comments
            </button>
          </div>
        )}

        {/* Features Showcase */}
        <div className="mt-16 p-6 bg-gradient-to-r from-pink-500/20 to-violet-500/20 backdrop-blur-xl rounded-3xl border border-pink-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Award className="w-6 h-6 text-yellow-400" />
            <span>Comment System Features</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>Nested replies (configurable depth)</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>Like & dislike system</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>User mentions (@username)</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>Comment editing & deletion</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>Pinned & highlighted comments</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>Moderation tools</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>Role-based permissions</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>Image attachments</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>Real-time interactions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCommentSystem;