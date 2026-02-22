import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Calendar,
  Clock,
  Tag,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/slices/hooks";
import {
  fetchPostById,
  clearDetailError,
  fetchPostLikeCount,
  addComment,
  fetchComments,
  fetchReplies,
} from "../../redux/slices/postDetailSlice";
import { toggleLike, toggleBookmark, likePost, bookmarkPost } from "../../redux/slices/postsListSlice";
import {
  selectFollowerCount,
} from "../../redux/slices/userSubscriptionsSlice";
import api from "../../utils/api";
import Comments from "../comments/Comments";

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

  // Debug: Log when likesCount changes
  useEffect(() => {
    console.log('Component re-rendered, post.likesCount:', post?.likesCount);
  }, [post?.likesCount]);

  // ✅ Get subscription status from new slice
  const bloggerId = post?.author?.id;
  const [isSubscribed, setIsSubscribed] = useState(false);
  const followerCount = useAppSelector((state) =>
    bloggerId ? selectFollowerCount(state, bloggerId) : 0
  );

  // Fetch post and comments on mount
  useEffect(() => {
    if (postId) {
      console.log("Fetching post details and comments for:", postId);
      dispatch(fetchPostById(postId))
        .unwrap()
        .then(() => {
          console.log("Post loaded, now fetching like count and comments");
          dispatch(fetchPostLikeCount(postId));
          dispatch(fetchComments(postId));
        })
        .catch((err) => console.error("Failed to fetch post:", err));
    }
    return () => {
      dispatch(clearDetailError());
    };
  }, [postId, dispatch]);
  
  // ✅ Check subscription status after post loads
  const fetchIsSubsc = async () => {
    if (post?.author?.id) {
      try {
        const resp = await api.get(`/user/action/is-subscribed?bloggerId=${post.author.id}`);
        setIsSubscribed(resp?.data);
      } catch (err) {
        console.error("Failed to fetch subscription status:", err);
      }
    }
  };

  useEffect(() => {
    fetchIsSubsc();
  }, [post]);

  const getImageSource = () => {
    if (!post)
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop";
    const postAny = post as any;
    if (postAny.coverImageData) return postAny.coverImageData;
    if (post.coverImage) return post.coverImage;
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
      dispatch(likePost({ postId: post.id, isLiked: post.isLiked }))
        .unwrap()
        .then(res => console.log("Like success:", res))
        .catch(err => {
          console.error("Like failed:", err);
          dispatch(toggleLike(post.id));
        });
    }
  };

  const handleBookmark = () => {
    if (post) {
      dispatch(toggleBookmark(post.id));
      dispatch(bookmarkPost({ postId: post.id, isBookmarked: !!post.isBookmarked }))
        .unwrap()
        .then(res => console.log("Bookmark success:", res))
        .catch(err => {
          console.error("Bookmark failed:", err);
          dispatch(toggleBookmark(post.id));
        });
    }
  };

  const handleSubscribe = async () => {
    if (bloggerId) {
      if (!isSubscribed) {
        await api.post(`/user/action/subscribe?bloggerId=${bloggerId}`);
        setIsSubscribed(true);
      } else {
        await api.post(`/user/action/unsubscribe?bloggerId=${bloggerId}`);
        setIsSubscribed(false);
      }
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || "";
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
      copy: url,
    };
    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], "_blank");
    }
  };

  const handleAddComment = (content: string, parentId?: string) => {
    if (postId && currentUser) {
      // Use the unified addComment thunk for both top-level and replies
      dispatch(addComment({ 
        postId, 
        content, 
        userId: currentUser.id.toString(),
        author: {
          id: currentUser.id.toString(),
          name: currentUser.username,
          username: currentUser.username,
          avatar: currentUser.avatar || 'https://via.placeholder.com/40'
        },
        parentId: parentId || null
      }))
      .unwrap()
      .then(() => {
        console.log(parentId ? "Reply added successfully" : "Comment added successfully");
      })
      .catch((err) => {
        console.error("Failed to add interaction:", err);
      });
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white relative z-10 pt-6 pb-24 lg:pb-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-400 hover:text-white ml-4 transition-all duration-300 hover:transform hover:translate-x-1"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to posts</span>
      </button>

      <article className="max-w-4xl mx-auto glass-panel rounded-2xl md:rounded-3xl border border-white/20 overflow-hidden mt-4 md:mt-6 p-4 md:p-6 lg:mx-auto mx-4">
        <div className="relative h-64 md:h-96 overflow-hidden rounded-t-3xl">
          <img
            src={getImageSource()}
            alt={post.title || "Post Image"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <span className="px-3 py-1 bg-primary/80 text-white text-sm font-medium rounded-full backdrop-blur-sm">
              {post.category || "Uncategorized"}
            </span>
            <div className="flex items-center space-x-4 text-gray-300 text-sm mt-2">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{post.publishDate || "Unknown Date"}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{post.readTime || "5 min read"}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{(post.stats?.views || 0).toLocaleString()} views</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-4">
              {post.title || "Untitled Post"}
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-white/10 mt-4">
          <div className="flex items-center space-x-4">
            <img
              src={post.author?.avatar || "https://via.placeholder.com/150"}
              alt={post.author?.name || "Author"}
              className="w-14 h-14 rounded-full border-2 border-white/20 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              onClick={() => {
                const id = post.author?.id;
                if (id) navigate(`/profile/${id}`);
              }}
            />
            <div>
              <h3 
                className="font-semibold text-white text-lg cursor-pointer hover:text-primary transition-colors"
                onClick={() => {
                  const id = post.author?.id;
                  if (id) navigate(`/profile/${id}`);
                }}
              >
                {post.author?.username || "Unknown Author"}
              </h3>
              <p className="text-gray-400 text-sm">
                {followerCount > 0
                  ? followerCount.toLocaleString()
                  : (post.author?.stats?.followers || 0).toLocaleString()}{" "}
                followers
              </p>
              {post.author?.bio && (
                <p className="text-gray-300 text-sm">{post.author.bio}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={!bloggerId}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              isSubscribed
                ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                : "bg-primary text-white hover:bg-rose-600 hover:shadow-lg hover:scale-105"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubscribed ? "Subscribed ✓" : "Subscribe"}
          </button>
        </div>

        <div className="prose prose-invert max-w-none my-6 text-gray-300">
          {post.content ? (
            formatContent(post.content)
          ) : (
            <p>No content available.</p>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, i) => (
              <button
                key={i}
                className="px-3 py-1 bg-white/10 text-gray-400 text-xs rounded-full flex items-center space-x-1"
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between py-4 border-t border-b border-white/10">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                post.isLiked
                  ? "text-primary bg-primary/20 hover:bg-primary/30"
                  : "text-gray-400 hover:text-primary hover:bg-primary/10"
              }`}
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
              <span>{post.likesCount || 0}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                showComments
                  ? "text-primary bg-primary/20 hover:bg-primary/30 border border-primary/20"
                  : "text-gray-400 hover:text-primary hover:bg-primary/10"
              }`}
            >
              <MessageCircle className={`w-5 h-5 ${showComments ? "fill-current" : ""}`} />
              <span>{post.commentsCount || 0}</span>
            </button>

            <button
              onClick={() => handleShare("copy")}
              className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-300"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full transition-all duration-300 ${
              post.isBookmarked
                ? "text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30"
                : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${post.isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>

        {showComments && (
          <div className="mt-8 transition-all duration-500 animate-in fade-in slide-in-from-top-4">
            <Comments
              postId={postId || ""}
              currentUser={{
                id: currentUser?.id?.toString() || "guest",
                name: currentUser?.username || "Guest",
                username: currentUser?.username || "guest",
                avatar: currentUser?.avatar || "https://via.placeholder.com/40",
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
      </article>
    </div>
  );
};

export default BlogPostDetail;
