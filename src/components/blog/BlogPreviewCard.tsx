import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Eye,
  Calendar,
  Tag,
  Clock
} from 'lucide-react';
import { useAppDispatch } from '../../redux/slices/hooks';
import { toggleLike, toggleBookmark, toggleSubscribe } from '../../redux/slices/postsListSlice';
import type { BlogPost } from '../../types';

interface BlogPreviewCardProps {
  post: BlogPost;
}

const BlogPreviewCard: React.FC<BlogPreviewCardProps> = ({ post }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Function to truncate content for preview
  const truncateContent = (content: string, maxLength: number = 150) => {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('a') ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'A'
    ) {
      return;
    }
    navigate(`/post/${post.id}`);
  };

  return (
    <article 
      className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02] cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={post?.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
          <span className="px-3 py-1 bg-pink-500/80 text-white text-sm font-medium rounded-full backdrop-blur-sm">
            {post.category}
          </span>
        </div>
        {/* Read More Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-medium rounded-full border border-white/30">
            Read Full Article
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Author Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={post.author?.avatar}
              alt={post.author?.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold text-white">{post.author?.username}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{post.publishDate}</span>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(toggleSubscribe(post.id));
            }}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
              post.author?.isSubscribed
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg'
            }`}
          >
            {post.author?.isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Post Title */}
        <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-pink-300 transition-colors">
          {post.title}
        </h2>

        {/* Post Preview Content */}
        <p className="text-gray-300 mb-4 line-clamp-3 text-sm leading-relaxed">
          {truncateContent(post.content)}
        </p>

        {/* Tags - Show only first 3 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/10 text-gray-400 text-xs rounded-full flex items-center space-x-1"
            >
              <Tag className="w-3 h-3" />
              <span>{tag}</span>
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="px-2 py-1 bg-white/10 text-gray-400 text-xs rounded-full">
              +{post.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(toggleLike(post.id));
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 ${
                post.stats?.isLiked
                  ? 'text-red-400 bg-red-500/20'
                  : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${post.stats?.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.stats?.likes}</span>
            </button>

            <div className="flex items-center space-x-2 px-3 py-2 text-gray-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.stats?.comments}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle share functionality
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-300"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400 flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.stats?.views}</span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(toggleBookmark(post.id));
              }}
              className={`p-2 rounded-full transition-all duration-300 ${
                post.stats?.isBookmarked
                  ? 'text-yellow-400 bg-yellow-500/20'
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${post.stats?.isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Read More Button */}
        <div className="mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/post/${post.id}`);
            }}
            className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-medium text-white transition-all duration-300 hover:border-pink-400/50"
          >
            Read Full Article →
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogPreviewCard;