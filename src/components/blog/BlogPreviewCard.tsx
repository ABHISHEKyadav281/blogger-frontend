import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye,
  Calendar,
  Clock
} from 'lucide-react';
import { useAppDispatch } from '../../redux/slices/hooks';

import { toggleSubscribe } from '../../redux/slices/postsListSlice';
import type { BlogPost } from '../../types';

interface BlogPreviewCardProps {
  post: BlogPost;
}

const BlogPreviewCard: React.FC<BlogPreviewCardProps> = ({ post }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Function to strip HTML tags
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Function to truncate content for preview
  const truncateContent = (content: string, maxLength: number = 150) => {
    const cleanText = stripHtml(content);
    return cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '...' 
      : cleanText;
  };

  // Get the correct image source
   const getImageSource = () => {
    if (!post)
      return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop";
    
    // Check for coverImageData (Base64)
    const postAny = post as any;
    if (postAny.coverImageData) {
        if (postAny.coverImageData.startsWith('data:image')) {
            return postAny.coverImageData;
        }
        // Assume JPEG if no prefix
        return `data:image/jpeg;base64,${postAny.coverImageData}`;
    }

    // Check for coverImage (URL)
    if (post.coverImage) {
        if (post.coverImage.startsWith('http')) return post.coverImage;
        // If relative path, prepend backend URL? Or maybe it's base64 without prefix?
        // Let's assume it might be relative path served by backend static files
        return `http://localhost:8080${post.coverImage.startsWith('/') ? '' : '/'}${post.coverImage}`;
    }
    
    return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop";
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
          src={getImageSource()}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
          <span className="px-3 py-1 bg-primary/80 text-white text-sm font-medium rounded-full backdrop-blur-sm">
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
          <div className="flex items-center space-x-4"> {/* Gap profile pic and author name */}
            <img
              src={post.author?.avatar || 'https://via.placeholder.com/40'}
              alt={post.author?.username}
              className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (post.author?.id) navigate(`/profile/${post.author.id}`);
              }}
            />
            <div>
              <p 
                className="font-bold text-lg text-white mb-1 capitalize cursor-pointer hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (post.author?.id) navigate(`/profile/${post.author.id}`);
                }}
              >
                {post.author?.username}
              </p> {/* Gap user name and post time */}
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{post.publishDate}</span>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(toggleSubscribe(post.id));
              }}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
                post.author?.isSubscribed
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-primary text-white hover:bg-rose-700 hover:shadow-lg'
              }`}
            >
              {post.author?.isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
            <div className="flex items-center space-x-1 text-gray-400">
              <span className="text-xs font-medium">{post.stats?.views}</span>
              <Eye className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Post Title */}
        <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-accent transition-colors">
          {post.title}
        </h2>

        {/* Post Preview Content */}
        <p className="text-gray-300 mb-4 line-clamp-3 text-lg leading-relaxed">
          {truncateContent(post.excerpt || post.content)}
        </p>

        {/* Action Buttons */}


        {/* Read More Button */}
        <div className="mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/post/${post.id}`);
            }}
            className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-medium text-white transition-all duration-300 hover:border-primary/50"
          >
            Read Full Article →
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogPreviewCard;