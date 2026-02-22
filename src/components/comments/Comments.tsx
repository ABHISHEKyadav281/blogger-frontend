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
  Reply,
  Clock,
  Check,
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
  parentId?: string;
  replyCount?: number;
}

interface CommentSystemProps {
  postId: string;
  currentUser: User;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
  onDislikeComment: (commentId: string) => void;
  onPinComment?: (commentId: string) => void;
  onReportComment?: (commentId: string, reason: string) => void;
  onFetchReplies?: (parentId: string) => void;
  maxDepth?: number;
  sortBy?: 'newest' | 'oldest' | 'popular';
}

// Comment Composer Component
const CommentComposer: React.FC<{
  currentUser: User;
  onSubmit: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  isReply?: boolean;
  onCancel?: () => void;
  initialValue?: string;
}> = ({ 
  currentUser, 
  onSubmit, 
  placeholder = "Share your thoughts...", 
  autoFocus = false,
  isReply = false,
  onCancel,
  initialValue = ""
}) => {
  const [content, setContent] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to the end
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className={`${isReply ? 'bg-white/5 rounded-2xl p-4 border border-white/10' : 'glass-panel rounded-2xl p-6 mb-8 shadow-2xl relative z-10'}`}>
      <div className="flex space-x-4">
        <img
          src={currentUser?.avatar || 'https://via.placeholder.com/40'}
          alt={currentUser?.name || 'User'}
          className="w-10 h-10 rounded-full border-2 border-white/20 flex-shrink-0"
        />
        
        <div className="flex-1 space-y-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className={`w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white/10 resize-none transition-all duration-300 ${
                isReply ? 'min-h-20' : 'min-h-24'
              }`}
              rows={isReply ? 3 : 4}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {content.length}/1000
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Press Ctrl + Enter to post
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
                className="flex items-center space-x-2 px-8 py-2 bg-primary text-white font-medium rounded-full hover:bg-rose-600 hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isReply ? 'Reply' : 'Post Comment'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  onFetchReplies?: (parentId: string) => void;
  replyingTo: string | null;
  setReplyingTo: (commentId: string | null) => void;
  onAddComment: (content: string, parentId?: string) => void;
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
  onReport,
  onFetchReplies,
  replyingTo,
  setReplyingTo,
  onAddComment
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const isOwner = comment?.author?.id && currentUser?.id && String(comment.author.id) === String(currentUser.id);
  const canModerate = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

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
        return <Award className="w-4 h-4 text-yellow-400" aria-label="Admin" />;
      case 'moderator':
        return <Award className="w-4 h-4 text-emerald-400" aria-label="Moderator" />;
      case 'verified':
        return <Check className="w-4 h-4 text-green-400" aria-label="Verified" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'recent';
    const now = new Date();
    const commentTime = new Date(timestamp);
    if (isNaN(commentTime.getTime())) return 'recent';
    
    const diffMs = now.getTime() - commentTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'just now';
  };
  
  const handleViewReplies = async () => {
    if (!comment.replies && onFetchReplies) {
      setIsLoadingReplies(true);
      try {
        await onFetchReplies(comment.id);
      } finally {
        setIsLoadingReplies(false);
      }
    }
    setShowReplies(true);
  };

  const handleReplyClick = () => {
    onReply(comment.id);
  };

  const handleAddReply = (content: string) => {
    // If we are replying to a reply, the original parent remains the parent
    // but we add a mention as requested by the user.
    const effectiveParentId = comment.parentId || comment.id;
    onAddComment(content, effectiveParentId);
    setReplyingTo(null);
  };

  // Determine mention if replying to a reply
  const initialReplyContent = comment.parentId ? `@${comment.author.name} ` : "";

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mb-2'}`}>
      <div className={`flex space-x-3 ${comment.isPinned ? 'bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4' : ''}`}>
        <div className="relative">
          <img 
            src={comment?.author?.avatar || 'https://via.placeholder.com/40'} 
            alt={comment?.author?.name || 'User'}
            className="w-10 h-10 rounded-full border-2 border-white/20"
          />
          {comment?.author?.role && (
            <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1">
              {getRoleIcon(comment.author.role)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="font-semibold text-white truncate">{comment?.author?.name || 'User'}</span>
              <span className="text-gray-500 text-sm flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{comment?.timestamp ? formatTimestamp(comment.timestamp) : 'recent'}</span>
              </span>
              {comment.isPinned && (
                <div className="flex items-center space-x-1 text-yellow-400 text-xs">
                  <Pin className="w-3 h-3" />
                  <span>Pinned</span>
                </div>
              )}
            </div>

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

              {showReportMenu && (
                <div className="absolute right-0 top-8 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl py-2 min-w-56 z-20">
                  <div className="px-4 py-2 text-white font-medium border-b border-white/10">
                    Report Comment
                  </div>
                  {['Spam', 'Harassment', 'Inappropriate Content', 'Other'].map((reason) => (
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

          <div>
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
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
                    className="px-4 py-2 bg-primary hover:bg-rose-600 text-white rounded-full transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 leading-relaxed mb-3">{comment.content}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onLike(comment.id)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all ${
                    comment.isLiked 
                      ? 'text-primary bg-primary/20' 
                      : 'text-gray-400 hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{comment.likes}</span>
                </button>

                <button
                  onClick={() => onDislike(comment.id)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all ${
                    comment.isDisliked 
                      ? 'text-gray-400 bg-white/20' 
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <ThumbsDown className={`w-4 h-4 ${comment.isDisliked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{comment.dislikes}</span>
                </button>
              </div>

              <button
                onClick={handleReplyClick}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all text-sm border border-transparent ${
                  replyingTo === comment.id 
                    ? 'text-white bg-primary' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            </div>

            {(comment.replyCount && comment.replyCount > 0 || (comment.replies && comment.replies.length > 0)) && !showReplies && (
              <button
                onClick={handleViewReplies}
                disabled={isLoadingReplies}
                className="flex items-center space-x-2 text-primary hover:text-rose-400 transition-colors text-sm font-semibold group bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:border-primary/30"
              >
                {isLoadingReplies ? (
                   <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                )}
                <span>Show {comment.replyCount} {comment.replyCount === 1 ? 'Reply' : 'Replies'}</span>
              </button>
            )}

            {comment?.replies && comment.replies.length > 0 && showReplies && (
              <button
                onClick={() => setShowReplies(false)}
                className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ChevronUp className="w-4 h-4" />
                <span>Hide replies</span>
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-4">
              <CommentComposer
                currentUser={currentUser}
                onSubmit={handleAddReply}
                placeholder={`Reply to ${comment?.author?.name || 'User'}...`}
                autoFocus={true}
                isReply={true}
                initialValue={initialReplyContent}
                onCancel={() => setReplyingTo(null)}
              />
            </div>
          )}

          {comment?.replies && comment.replies.length > 0 && showReplies && (
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
                  onFetchReplies={onFetchReplies}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  onAddComment={onAddComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// Main Comment System Component
const Comments: React.FC<CommentSystemProps> = ({
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
  onFetchReplies,
  maxDepth = 3,
  sortBy = 'newest'
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sortOrder] = useState<'newest' | 'oldest' | 'popular'>(sortBy);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleAddComment = (content: string, parentId?: string) => {
    onAddComment(content, parentId);
    setReplyingTo(null);
  };

  const handleEditComment = (commentId: string, content: string) => {
    onEditComment(commentId, content);
  };

  const handleDeleteComment = (commentId: string) => {
    onDeleteComment(commentId);
  };

  const handleLikeComment = (commentId: string) => {
    onLikeComment(commentId);
  };

  const handleDislikeComment = (commentId: string) => {
    onDislikeComment(commentId);
  };

  const handlePinComment = (commentId: string) => {
    onPinComment?.(commentId);
  };

  const handleReportComment = (commentId: string, reason: string) => {
    onReportComment?.(commentId, reason);
  };

  const sortedComments = (Array.isArray(comments) ? [...comments] : []).sort((a, b) => {
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

  return (
    <div className="w-full text-white">
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Add Comment */}
        <div className="mb-8">
          <CommentComposer
            currentUser={currentUser}
            onSubmit={(content) => handleAddComment(content)}
          />
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {sortedComments.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">No comments yet</h3>
              <p className="text-gray-400 text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            sortedComments.map((comment) => (
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
                  onFetchReplies={onFetchReplies}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  onAddComment={handleAddComment}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;