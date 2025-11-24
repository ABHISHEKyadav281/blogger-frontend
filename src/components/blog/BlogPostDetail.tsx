import React, { useState } from 'react';
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
  User,
  Send,
  MoreHorizontal,
  Flag,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Sparkles
} from 'lucide-react';

// Types
interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
    followers: number;
    isSubscribed: boolean;
  };
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  stats: {
    likes: number;
    comments: number;
    views: number;
    isLiked: boolean;
    isBookmarked: boolean;
  };
  coverImage: string;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

// Sample blog post data
const samplePost: BlogPost = {
  id: '1',
  title: 'The Evolution of Animation in Attack on Titan: A Technical Deep Dive',
  content: `
From Season 1 to the Final Season, Attack on Titan has undergone remarkable visual transformations that showcase the evolution of modern anime production. This comprehensive analysis explores how WIT Studio and MAPPA approached the monumental task of bringing Hajime Isayama's masterpiece to life.

## The WIT Studio Era (Seasons 1-3)

When WIT Studio first adapted Attack on Titan in 2013, they faced the challenge of translating Isayama's unique art style into fluid animation. The studio's approach was revolutionary for its time:

**Character Animation Excellence**
The fluidity of the ODM gear sequences became WIT Studio's signature. Each movement was carefully choreographed to convey weight and momentum. The animators studied real-world physics to ensure that every swing, every turn, and every gas burst felt authentic.

**Color Palette and Mood**
WIT Studio established the series' distinctive color palette - muted earth tones that reflected the grim reality of humanity's situation. The walls weren't just barriers; they were visual metaphors rendered in weathered stone and fading paint.

## The MAPPA Transition (Season 4)

When MAPPA took over for the Final Season, they inherited not just a story, but a visual legacy. The transition marked a significant shift in animation philosophy:

**CGI Integration**
MAPPA's bold decision to use CGI for the Titan sequences was controversial but necessary. The complexity of the War for Paradis arc, with its multiple Titan shifters and large-scale battles, demanded a different approach. The studio spent months perfecting the blend between traditional 2D animation and 3D models.

**Character Design Evolution**
The time skip allowed MAPPA to reimagine character designs. Eren's more mature appearance, Mikasa's refined features, and Armin's confident posture all reflected their internal growth through subtle visual changes.

## Technical Innovations

Both studios pushed the boundaries of what anime could achieve:

**Camera Work**
The dynamic camera movements during action sequences created a cinematic experience. Virtual cameras swept through three-dimensional spaces, making viewers feel like they were flying alongside the Survey Corps.

**Lighting and Effects**
The transformation sequences, particularly the Colossal Titan's steam and the Attack Titan's lightning, required innovative particle effects that became industry benchmarks.

## Impact on the Industry

Attack on Titan's animation evolution reflects broader changes in anime production:

- **Higher Production Values**: The series proved that audiences would invest in quality animation
- **International Recognition**: The visual spectacle helped anime gain mainstream Western acceptance
- **Technical Standards**: Many studios now use AOT's techniques as reference points

## Conclusion

The visual journey of Attack on Titan represents more than just an adaptation - it's a testament to the artistry and technical innovation that drives modern anime. Both WIT Studio and MAPPA contributed unique strengths that elevated Isayama's vision beyond what any single studio could achieve alone.

The series stands as a masterclass in visual storytelling, proving that animation isn't just about movement - it's about emotion, atmosphere, and the power to make audiences believe in impossible worlds.
  `,
  author: {
    name: 'AnimeTechReview',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    bio: 'Technical analyst specializing in animation production and visual storytelling. 5+ years covering anime industry trends.',
    followers: 2340,
    isSubscribed: false
  },
  publishDate: 'March 15, 2024',
  readTime: '12 min read',
  category: 'Technical Analysis',
  tags: ['AttackOnTitan', 'Animation', 'MAPPA', 'WITStudio', 'TechnicalAnalysis'],
  stats: {
    likes: 234,
    comments: 45,
    views: 1205,
    isLiked: false,
    isBookmarked: false
  },
  coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop'
};

// Sample comments
const sampleComments: Comment[] = [
  {
    id: '1',
    author: 'OtakuMaster99',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    content: 'This is an incredible analysis! I never realized how much thought went into the camera work during the ODM gear scenes. The technical breakdown of the WIT Studio era really opened my eyes to the artistry behind those fluid movements.',
    timestamp: '2 hours ago',
    likes: 23,
    isLiked: true,
    replies: [
      {
        id: '1-1',
        author: 'AnimeLover2024',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b152bbef?w=40&h=40&fit=crop&crop=face',
        content: 'Totally agree! The physics attention in those sequences was insane. You could feel the weight and momentum.',
        timestamp: '1 hour ago',
        likes: 8,
        isLiked: false
      },
      {
        id: '1-2',
        author: 'TechAnimeFan',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=40&h=40&fit=crop&crop=face',
        content: '@OtakuMaster99 Right? And the way they handled the transition between studios while maintaining visual continuity was masterful.',
        timestamp: '45 minutes ago',
        likes: 5,
        isLiked: false
      }
    ]
  },
  {
    id: '2',
    author: 'StudioAnalyst',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    content: 'Great article! I work in animation and can confirm that MAPPA\'s CGI approach was revolutionary. The hate they got initially was unfair - they were solving complex production challenges that people didn\'t understand. 🔥',
    timestamp: '4 hours ago',
    likes: 67,
    isLiked: false,
    replies: [
      {
        id: '2-1',
        author: 'AnimeTechReview',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        content: 'Thanks for the industry insight! It\'s always valuable to hear from people actually working in production. The technical constraints MAPPA faced were enormous.',
        timestamp: '3 hours ago',
        likes: 12,
        isLiked: false
      }
    ]
  },
  {
    id: '3',
    author: 'MangaReader123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    content: 'As someone who read the manga first, seeing these scenes animated was mind-blowing. Both studios brought something unique to the table. This analysis perfectly captures why the show works so well visually.',
    timestamp: '6 hours ago',
    likes: 34,
    isLiked: false
  }
];

// Main Component
const BlogPostDetail: React.FC = () => {
  const [post, setPost] = useState(samplePost);
  const [comments, setComments] = useState(sampleComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Handle like post
  const handleLikePost = () => {
    setPost(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        isLiked: !prev.stats.isLiked,
        likes: prev.stats.isLiked ? prev.stats.likes - 1 : prev.stats.likes + 1
      }
    }));
  };

  // Handle bookmark post
  const handleBookmark = () => {
    setPost(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        isBookmarked: !prev.stats.isBookmarked
      }
    }));
  };

  // Handle subscribe to author
  const handleSubscribe = () => {
    setPost(prev => ({
      ...prev,
      author: {
        ...prev.author,
        isSubscribed: !prev.author.isSubscribed
      }
    }));
  };

  // Handle add comment
  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
        content: newComment,
        timestamp: 'just now',
        likes: 0,
        isLiked: false,
        replies: []
      };
      setComments([comment, ...comments]);
      setNewComment('');
      
      // Update comment count
      setPost(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          comments: prev.stats.comments + 1
        }
      }));
    }
  };

  // Handle add reply
  const handleAddReply = (commentId: string) => {
    if (replyContent.trim()) {
      const reply: Comment = {
        id: `${commentId}-${Date.now()}`,
        author: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
        content: replyContent,
        timestamp: 'just now',
        likes: 0,
        isLiked: false
      };

      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ));
      
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  // Handle like comment
  const handleLikeComment = (commentId: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(comments.map(comment => 
        comment.id === parentId 
          ? {
              ...comment,
              replies: comment.replies?.map(reply =>
                reply.id === commentId
                  ? {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                    }
                  : reply
              )
            }
          : comment
      ));
    } else {
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
            }
          : comment
      ));
    }
  };

  // Handle share
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post.title;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
    
    setShowShareMenu(false);
  };

  // Format content with basic markdown-like styling
  const formatContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-white mb-4 mt-8 first:mt-0">
              {paragraph.replace('## ', '')}
            </h2>
          );
        }
        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
          return (
            <h3 key={index} className="text-lg font-semibold text-pink-300 mb-3 mt-6">
              {paragraph.replace(/\*\*/g, '')}
            </h3>
          );
        }
        if (paragraph.startsWith('- ')) {
          const listItems = paragraph.split('\n').filter(item => item.startsWith('- '));
          return (
            <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-gray-300">
              {listItems.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item.replace('- ', '')}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="text-gray-300 leading-relaxed mb-6">
            {paragraph}
          </p>
        );
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-all duration-300 hover:transform hover:translate-x-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to posts</span>
        </button>

        {/* Main Article */}
        <article className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
          {/* Hero Section */}
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            {/* Hero Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-pink-500/80 text-white text-sm font-medium rounded-full backdrop-blur-sm">
                  {post.category}
                </span>
                <div className="flex items-center space-x-4 text-gray-300 text-sm">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{post.publishDate}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.stats.views.toLocaleString()} views</span>
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {post.title}
              </h1>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Author Section */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <img 
                  src={post?.author?.avatar} 
                  alt={post?.author?.name} 
                  className="w-14 h-14 rounded-full border-2 border-white/20"
                />
                <div>
                  <h3 className="font-semibold text-white text-lg">{post.author.name}</h3>
                  <p className="text-gray-400 text-sm mb-1">{post.author.followers.toLocaleString()} followers</p>
                  <p className="text-gray-300 text-sm">{post.author.bio}</p>
                </div>
              </div>
              <button
                onClick={handleSubscribe}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  post.author.isSubscribed
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                    : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg hover:scale-105'
                }`}
              >
                {post.author.isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
              </button>
            </div>

            {/* Article Content */}
            <div className="prose prose-invert max-w-none mb-8">
              {formatContent(post.content)}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-8">
              {post.tags.map((tag, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-white/10 hover:bg-pink-500/20 border border-white/20 hover:border-pink-500/30 text-gray-400 hover:text-pink-300 rounded-full transition-all duration-300 flex items-center space-x-2"
                >
                  <Tag className="w-4 h-4" />
                  <span>#{tag}</span>
                </button>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between py-6 border-t border-b border-white/10 mb-8">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLikePost}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-300 ${
                    post.stats.isLiked 
                      ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30' 
                      : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${post.stats.isLiked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{post.stats.likes}</span>
                </button>

                <div className="flex items-center space-x-3 px-4 py-2 text-gray-400">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-medium">{post.stats.comments}</span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-full text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-300"
                  >
                    <Share2 className="w-6 h-6" />
                    <span>Share</span>
                  </button>

                  {showShareMenu && (
                    <div className="absolute top-full mt-2 left-0 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4 min-w-48">
                      <div className="space-y-2">
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          <Twitter className="w-5 h-5 text-blue-400" />
                          <span>Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          <Facebook className="w-5 h-5 text-blue-600" />
                          <span>Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          <Linkedin className="w-5 h-5 text-blue-500" />
                          <span>LinkedIn</span>
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                          <Copy className="w-5 h-5" />
                          <span>Copy Link</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBookmark}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    post.stats.isBookmarked 
                      ? 'text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30' 
                      : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                  }`}
                >
                  <Bookmark className={`w-6 h-6 ${post.stats.isBookmarked ? 'fill-current' : ''}`} />
                </button>

                <button className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300">
                  <Flag className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
                <MessageCircle className="w-7 h-7" />
                <span>Comments ({comments.length})</span>
              </h3>

              {/* Add Comment */}
              <div className="mb-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="flex space-x-4">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face"
                    alt="Your avatar"
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts about this post..."
                      className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white/10 resize-none transition-all duration-300"
                      rows={4}
                    />
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-400">
                        {newComment.length}/500 characters
                      </div>
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Post Comment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-4">
                    {/* Main Comment */}
                    <div className="flex space-x-4">
                      <img 
                        src={comment.avatar} 
                        alt={comment.author} 
                        className="w-12 h-12 rounded-full border-2 border-white/20" 
                      />
                      <div className="flex-1">
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-white">{comment.author}</span>
                              <span className="text-sm text-gray-400">{comment.timestamp}</span>
                            </div>
                            <button className="text-gray-400 hover:text-white transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{comment.content}</p>
                        </div>
                        
                        {/* Comment Actions */}
                        <div className="flex items-center space-x-6 mt-3 ml-2">
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className={`flex items-center space-x-2 text-sm transition-colors ${
                              comment.isLiked 
                                ? 'text-red-400' 
                                : 'text-gray-400 hover:text-red-400'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                            <span>{comment.likes}</span>
                          </button>
                          
                          <button 
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                          >
                            Reply
                          </button>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment.id && (
                          <div className="mt-4 ml-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex space-x-3">
                              <img
                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                                alt="Your avatar"
                                className="w-8 h-8 rounded-full"
                              />
                              <div className="flex-1">
                                <textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder={`Reply to ${comment.author}...`}
                                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 resize-none"
                                  rows={2}
                                />
                                <div className="flex justify-end space-x-3 mt-3">
                                  <button
                                    onClick={() => {setReplyingTo(null); setReplyContent('');}}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleAddReply(comment.id)}
                                    disabled={!replyContent.trim()}
                                    className="px-4 py-2 text-sm bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-8 mt-4 space-y-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex space-x-3">
                                <img 
                                  src={reply.avatar} 
                                  alt={reply.author} 
                                  className="w-10 h-10 rounded-full border-2 border-white/20" 
                                />
                                <div className="flex-1">
                                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium text-white text-sm">{reply.author}</span>
                                        <span className="text-xs text-gray-400">{reply.timestamp}</span>
                                      </div>
                                      <button className="text-gray-400 hover:text-white transition-colors">
                                        <MoreHorizontal className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">{reply.content}</p>
                                  </div>
                                  
                                  {/* Reply Actions */}
                                  <div className="flex items-center space-x-4 mt-2 ml-2">
                                    <button
                                      onClick={() => handleLikeComment(reply.id, true, comment.id)}
                                      className={`flex items-center space-x-1 text-xs transition-colors ${
                                        reply.isLiked 
                                          ? 'text-red-400' 
                                          : 'text-gray-400 hover:text-red-400'
                                      }`}
                                    >
                                      <Heart className={`w-3 h-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                                      <span>{reply.likes}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Comments */}
              {comments.length > 0 && (
                <div className="text-center mt-8">
                  <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-gray-300 hover:text-white transition-all duration-300">
                    Load More Comments
                  </button>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Related Posts Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
            <Sparkles className="w-7 h-7 text-pink-400" />
            <span>Related Posts</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Related Post 1 */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=200&fit=crop" 
                alt="Related post" 
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <span className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded-full">
                  Character Analysis
                </span>
                <h3 className="font-semibold text-white mt-3 mb-2 line-clamp-2">
                  The Psychology Behind Eren Yeager's Character Arc
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  Exploring the complex psychological journey of Attack on Titan's protagonist...
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>March 12, 2024</span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>156</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>23</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Post 2 */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop" 
                alt="Related post" 
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                  Industry News
                </span>
                <h3 className="font-semibold text-white mt-3 mb-2 line-clamp-2">
                  MAPPA Studio Announces New Original Anime Project
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  The studio behind Jujutsu Kaisen and Chainsaw Man reveals their latest project...
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>March 10, 2024</span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>234</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>45</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;