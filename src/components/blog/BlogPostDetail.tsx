import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Bookmark,
  Eye,
  Calendar,
  Clock,
  Tag,
  Share2,
  Maximize2,
} from "lucide-react";
import ShareModal from "./ShareModal";
import ImageModal from "../ui/ImageModal";
import { useAppDispatch, useAppSelector } from "../../redux/slices/hooks";
import {
  fetchPostById,
  clearDetailError,
  fetchPostLikeCount,
  addComment,
  fetchComments,
  fetchReplies,
} from "../../redux/slices/postDetailSlice";
import {
  toggleLike,
  toggleBookmark,
  likePost,
  bookmarkPost,
} from "../../redux/slices/postsListSlice";
import { formatTimeAgo } from "../../utils/dateUtils";
import api from "../../utils/api";
import { API_BASE_URL } from "../../config";
import Comments from "../comments/Comments";
import { resolveAvatarUrl, resolveImageUrl } from "../../utils/urlUtils";

const AuthorAvatar: React.FC<{ 
  url: string | null | undefined; 
  username?: string; 
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}> = ({ url, username, size = 'md', onClick }) => {
  const [hasError, setHasError] = useState(false);
  
  // Re-enable image if URL changes
  useEffect(() => {
    setHasError(false);
  }, [url]);

  const sizes = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  if (!url || hasError) {
    return (
      <div 
        className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center text-white font-bold uppercase border-2 border-white/20 shadow-xl cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all`}
        onClick={onClick}
      >
        {(username || 'U').charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={resolveAvatarUrl(url, username)}
      alt={username || "Author"}
      className={`${sizes[size]} rounded-full border-2 border-white/20 object-cover cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all shadow-xl`}
      onClick={onClick}
      onError={() => setHasError(true)}
    />
  );
};

const BlogPostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    currentPost: post,
    comments,
    isLoading,
    error,
  } = useAppSelector((state) => state.postDetail);

  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [showComments, setShowComments] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // ✅ Use data from post response instead of extra API calls
  const bloggerId = post?.author?.id;
  const isSubscribedFromPost = (post as any)?.subscribed ?? false;
  const followerCountFromPost = post?.author?.followers ?? (post?.author as any)?.stats?.followers ?? 0;

  // Fetch post and comments on mount
  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId))
        .unwrap()
        .then(() => {
          dispatch(fetchPostLikeCount(postId));
          dispatch(fetchComments(postId));
        })
        .catch((err) => console.error("Failed to fetch post:", err));
    }
    return () => {
      dispatch(clearDetailError());
    };
  }, [postId, dispatch]);

  const getImageSource = () => {
    if (!post)
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop";
    
    const postAny = post as any;
    if (postAny.coverImageData) {
      if (postAny.coverImageData.startsWith('data:image')) {
        return postAny.coverImageData;
      }
      return `data:image/jpeg;base64,${postAny.coverImageData}`;
    }

    if (post.coverImage) {
      return resolveImageUrl(post.coverImage);
    }
    
    return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop";
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-bold text-white mb-4 mt-6">
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3
            key={index}
            className="text-xl font-semibold text-white mb-3 mt-4"
          >
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("> ")) {
        return (
          <blockquote
            key={index}
            className="border-l-4 border-primary pl-4 text-gray-300 italic mb-4"
          >
            {line.replace("> ", "")}
          </blockquote>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="text-gray-300 mb-2 ml-4 list-disc">
            {line.replace("- ", "")}
          </li>
        );
      }
      if (line.trim() === "") {
        return <br key={index} />;
      }

      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded">$1</code>')
        .replace(
          /\[(.*?)\]\((.*?)\)/g,
          '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
        );

      return (
        <p
          key={index}
          className="text-gray-300 mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  const handleLike = () => {
    if (post) {
      dispatch(toggleLike(post.id));
      dispatch(likePost({ postId: post.id, isLiked: post.isLiked }));
    }
  };

  const handleBookmark = () => {
    if (post) {
      dispatch(toggleBookmark(post.id));
      dispatch(bookmarkPost({ postId: post.id, isBookmarked: !!post.isBookmarked }));
    }
  };

  const handleSubscribe = async () => {
    if (bloggerId) {
      try {
        if (!isSubscribedFromPost) {
          await api.post(`/user/action/subscribe?bloggerId=${bloggerId}`);
        } else {
          await api.post(`/user/action/unsubscribe?bloggerId=${bloggerId}`);
        }
        if (postId) dispatch(fetchPostById(postId));
      } catch (err) {
        console.error("Subscription toggle failed:", err);
      }
    }
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const handleAddComment = (content: string, parentId?: string) => {
    if (postId && currentUser) {
      dispatch(addComment({ 
        postId, 
        content, 
        userId: currentUser.id.toString(),
        author: {
          id: currentUser.id.toString(),
          name: currentUser.username,
          username: currentUser.username,
          profilePictureUrl: currentUser.profilePictureUrl || (currentUser as any).profileImage
        },
        parentId: parentId || null
      }));
    } else if (!currentUser) {
      alert("Please login to comment");
      navigate("/auth");
    }
  };

  const handleFetchReplies = (parentId: string) => {
    dispatch(fetchReplies(parentId));
  };

  if (isLoading && !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Error Loading Post</h2>
        <p className="text-gray-300 mb-6">{error}</p>
        <button
          onClick={() => navigate("/home")}
          className="px-6 py-2 bg-primary rounded-full hover:bg-rose-600 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-background text-white relative z-10 pt-6 pb-24 lg:pb-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <article className="max-w-7xl mx-auto glass-panel rounded-2xl md:rounded-3xl border border-white/20 overflow-hidden mt-4 md:mt-6 shadow-2xl mx-4 mb-20 lg:mb-6">
        {/* Post Cover Image */}
        <div className="relative h-64 md:h-96 w-full overflow-hidden">
          <img
            src={getImageSource()}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop";
            }}
          />
          
          <div className="absolute top-4 left-4 z-20">
            <button 
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate('/', { replace: true });
                }
              }}
              className="p-2.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-black/60 transition-all group active:scale-95"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
 
          <div className="absolute top-4 right-4 z-20">
            <button 
              onClick={() => setIsImageModalOpen(true)}
              className="p-2.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-black/60 transition-all active:scale-95"
              title="Full View"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-6 left-6 right-6 z-20">
            <span className="px-3 py-1 bg-primary/80 text-white text-xs font-medium rounded-full backdrop-blur-sm">
              {post.category || "Uncategorized"}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mt-3 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-300 text-sm">
              <span className="flex items-center space-x-1.5 text-white/90">
                <Calendar className="w-4 h-4" />
                <span>{formatTimeAgo(post.createdAt)}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4" />
                <span>{post.readTime || "5 min read"}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Eye className="w-4 h-4" />
                <span>{(post?.viewsCount || 0).toLocaleString()} views</span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {/* Author Section */}
          <div className="flex items-center justify-between pb-8 border-b border-white/10 mb-8">
            <div className="flex items-center space-x-4">
              <AuthorAvatar 
                url={post.author?.profilePictureUrl || (post.author as any)?.profileImage} 
                username={post.author?.username} 
                size="md"
                onClick={() => navigate(`/profile/${post.author?.id}`)} 
              />
              <div>
                <h3 
                  className="font-bold text-white text-lg cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/profile/${post.author?.id}`)}
                >
                  {post.author?.username || "Unknown Author"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {followerCountFromPost.toLocaleString()} followers
                </p>
              </div>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={!bloggerId}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                isSubscribedFromPost
                  ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  : "bg-primary text-white hover:bg-rose-600 shadow-lg shadow-primary/20"
              } disabled:opacity-50`}
            >
              {isSubscribedFromPost ? "Subscribed" : "Subscribe"}
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-rose max-w-none text-gray-200 text-lg leading-relaxed">
            {post.content ? formatContent(post.content) : <p>No content available.</p>}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {post.tags.map((tag, i) => (
                <button
                  key={i}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm rounded-xl border border-white/10 transition-colors flex items-center space-x-2"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          )}

          {/* Interaction Bar */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-all group ${
                  post.isLiked ? "text-primary scale-110" : "text-gray-400 hover:text-primary"
                }`}
              >
                <div className={`p-2.5 rounded-xl ${post.isLiked ? "bg-primary/20" : "bg-white/5 group-hover:bg-primary/10"} transition-colors`}>
                  <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                </div>
                <span className="font-medium">{post.likesCount || 0}</span>
              </button>
              
              <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center space-x-2 transition-all group ${
                  showComments ? "text-primary" : "text-gray-400 hover:text-primary"
                }`}
              >
                <div className={`p-2.5 rounded-xl ${showComments ? "bg-primary/20" : "bg-white/5 group-hover:bg-primary/10"} transition-colors`}>
                  <MessageCircle className={`w-5 h-5 ${showComments ? "fill-current" : ""}`} />
                </div>
                <span className="font-medium">{post.commentsCount || 0}</span>
              </button>

              <button
                onClick={handleShareClick}
                className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-green-500/10 transition-colors">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="font-medium">Share</span>
              </button>
            </div>

            <button
              onClick={handleBookmark}
              className={`transition-all group ${
                post.isBookmarked ? "text-yellow-400 scale-110" : "text-gray-400 hover:text-yellow-400"
              }`}
            >
              <div className={`p-2.5 rounded-xl ${post.isBookmarked ? "bg-yellow-500/20" : "bg-white/5 group-hover:bg-yellow-500/10"} transition-colors`}>
                <Bookmark className={`w-5 h-5 ${post.isBookmarked ? "fill-current" : ""}`} />
              </div>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
              <Comments
                postId={postId || ""}
                currentUser={{
                  id: currentUser?.id?.toString() || "guest",
                  name: currentUser?.username || "Guest",
                  username: currentUser?.username || "guest",
                  profilePictureUrl: currentUser?.profilePictureUrl ||"",
                  role: currentUser?.role
                }}
                comments={comments} 
                onAddComment={handleAddComment}
                onEditComment={() => {}}
                onDeleteComment={() => {}}
                onLikeComment={() => {}}
                onDislikeComment={() => {}}
                onFetchReplies={handleFetchReplies}
              />
            </div>
          )}
        </div>
      </article>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={window.location.href}
        title={post?.title || ""}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        src={getImageSource()}
        alt={post.title || "Post Image"}
      />
    </div>
  );
};

export default BlogPostDetail;
