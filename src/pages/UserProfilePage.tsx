import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/slices/hooks';
import { fetchUserDetails, fetchUserPosts } from '../redux/slices/userProfileSlice';
import api from '../utils/api';
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  MapPin, 
  Calendar, 
  Globe, 
  Twitter, 
  Instagram, 
  Github, 
  Mail,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  Share2,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  Settings,
  Camera,
  Image,
  Award,
  Star,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Tag,
  Filter,
  Grid,
  List,
  Search,
  Bell,
  Ban,
  Flag,
  Link as LinkIcon,
  Sparkles,
  Check
} from 'lucide-react';

// Types
interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  location: string;
  website?: string;
  joinDate: string;
  email: string;
  isVerified: boolean;
  role: 'admin' | 'moderator' | 'verified' | 'user';
  stats: {
    posts: number;
    followers: number;
    following: number;
    likes: number;
  };
  socialLinks: {
    twitter?: string;
    instagram?: string;
    github?: string;
  };
  preferences: {
    showEmail: boolean;
    allowMessages: boolean;
    showActivity: boolean;
  };
  isFollowing?: boolean;
  isBlocked?: boolean;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  publishDate: string;
  readTime: string;
  stats: {
    likes: number;
    comments: number;
    views: number;
    isLiked: boolean;
    isBookmarked: boolean;
  };
  status: 'published' | 'draft' | 'scheduled';
}

interface Activity {
  id: string;
  type: 'post' | 'like' | 'comment' | 'follow';
  content: string;
  timestamp: string;
  target?: string;
}

// Sample Data
const emptyUser: User = {
  id: '',
  name: '',
  username: '',
  avatar: '',
  coverImage: '',
  bio: '',
  location: '',
  website: '',
  joinDate: '',
  email: '',
  isVerified: false,
  role: 'user',
  stats: {
    posts: 0,
    followers: 0,
    following: 0,
    likes: 0
  },
  socialLinks: {},
  preferences: {
    showEmail: false,
    allowMessages: true,
    showActivity: true
  },
  isFollowing: false,
  isBlocked: false
};

// Utility to strip HTML tags
const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// Post Card Component
const PostCard: React.FC<{ 
  post: Post; 
  viewMode: 'grid' | 'list';
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onView: (id: string) => void;
}> = ({ post, viewMode, onLike, onBookmark, onView }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02] cursor-pointer"
           onClick={() => onView(post.id)}>
        <div className="flex">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-48 h-32 object-cover flex-shrink-0"
          />
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">
                {post.category}
              </span>
              <span className="text-gray-400 text-sm">{post.publishDate}</span>
            </div>
            <h3 className="font-semibold text-white mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.stats.views}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {e.stopPropagation(); onLike(post.id);}}
                  className={`flex items-center space-x-1 px-2 py-1 rounded transition-all ${
                    post.stats.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.stats.isLiked ? 'fill-current' : ''}`} />
                  <span>{post.stats.likes}</span>
                </button>
                <button
                  onClick={(e) => {e.stopPropagation(); onBookmark(post.id);}}
                  className={`p-1 rounded transition-all ${
                    post.stats.isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${post.stats.isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02] cursor-pointer"
         onClick={() => onView(post.id)}>
      <img 
        src={post.coverImage} 
        alt={post.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">
            {post.category}
          </span>
          <span className="text-gray-400 text-xs">{post.publishDate}</span>
        </div>
        <h3 className="font-semibold text-white mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-3">{post.excerpt}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-white/10 text-gray-400 text-xs rounded">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm text-gray-400">
            <span className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{post.stats.views}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{post.readTime}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {e.stopPropagation(); onLike(post.id);}}
              className={`flex items-center space-x-1 text-xs ${
                post.stats.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-3 h-3 ${post.stats.isLiked ? 'fill-current' : ''}`} />
              <span>{post.stats.likes}</span>
            </button>
            <button
              onClick={(e) => {e.stopPropagation(); onBookmark(post.id);}}
              className={`${
                post.stats.isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${post.stats.isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Profile Modal
const EditProfileModal: React.FC<{
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: Partial<User>) => void;
}> = ({ user, isOpen, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState(user);
  const [activeTab, setActiveTab] = useState<'profile' | 'social' | 'privacy'>('profile');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editedUser);
    onClose();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedUser(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedUser(prev => ({ ...prev, coverImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black/90 backdrop-blur-xl rounded-3xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4 bg-white/5 rounded-xl p-1">
            {[
              { id: 'profile', label: 'Profile', icon: Users },
              { id: 'social', label: 'Social Links', icon: LinkIcon },
              { id: 'privacy', label: 'Privacy', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Cover Image */}
              <div>
                <label className="block text-white font-medium mb-3">Cover Image</label>
                <div className="relative">
                  <div className="h-32 bg-gradient-to-r from-pink-500/20 to-violet-500/20 rounded-xl overflow-hidden">
                    {editedUser.coverImage && (
                      <img 
                        src={editedUser.coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-2 bg-black/70 hover:bg-black/80 text-white rounded-lg transition-all"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-white font-medium mb-3">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={editedUser.avatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full border-4 border-white/20"
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full transition-all"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{editedUser.name}</p>
                    <p className="text-gray-400 text-sm">@{editedUser.username}</p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={editedUser.username}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Bio</label>
                <textarea
                  value={editedUser.bio}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  maxLength={160}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 resize-none"
                />
                <div className="text-xs text-gray-400 mt-1">{editedUser.bio.length}/160</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={editedUser.location}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={editedUser.website || ''}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Twitter</label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <input
                    type="url"
                    value={editedUser.socialLinks.twitter || ''}
                    onChange={(e) => setEditedUser(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                    }))}
                    placeholder="https://twitter.com/yourusername"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Instagram</label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
                  <input
                    type="url"
                    value={editedUser.socialLinks.instagram || ''}
                    onChange={(e) => setEditedUser(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                    placeholder="https://instagram.com/yourusername"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">GitHub</label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={editedUser.socialLinks.github || ''}
                    onChange={(e) => setEditedUser(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, github: e.target.value }
                    }))}
                    placeholder="https://github.com/yourusername"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-medium text-white">Show Email Address</div>
                    <div className="text-sm text-gray-400">Display your email on your public profile</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedUser.preferences.showEmail}
                      onChange={(e) => setEditedUser(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, showEmail: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-medium text-white">Allow Direct Messages</div>
                    <div className="text-sm text-gray-400">Let other users send you private messages</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedUser.preferences.allowMessages}
                      onChange={(e) => setEditedUser(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, allowMessages: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-medium text-white">Show Activity</div>
                    <div className="text-sm text-gray-400">Display your recent activity on your profile</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedUser.preferences.showActivity}
                      onChange={(e) => setEditedUser(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, showActivity: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Profile Component
const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState<User>(emptyUser);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activity] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'activity' | 'about'>('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'oldest'>('newest');
  
  const { userId: urlUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { 
    data: profileData, 
    posts: profilePosts,
    isLoading, 
    isPostsLoading,
    error: profileError,
    postsError
  } = useAppSelector((state) => state.userProfile);
  const { user: authUser } = useAppSelector((state) => state.auth);

  const userId = urlUserId || authUser?.id?.toString();
  const isOwnProfile = !urlUserId || (authUser?.id && urlUserId.toString() === authUser.id.toString());

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserDetails(userId));
      dispatch(fetchUserPosts({ userId }));
      
      // Fetch subscription status
      if (!isOwnProfile) {
        api.get(`/user/action/is-subscribed?bloggerId=${userId}`)
          .then(resp => setIsSubscribed(resp.data))
          .catch(err => console.error("Failed to fetch subscription status:", err));
      }
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (profileData) {
      const mappedUser: User = {
        id: profileData.id || userId || '',
        name: profileData.firstName && profileData.lastName 
          ? `${profileData.firstName} ${profileData.lastName}` 
          : profileData.username,
        username: profileData.username,
        avatar: profileData.profileImage || `https://ui-avatars.com/api/?name=${profileData.username}&background=random`,
        coverImage: profileData.coverImage || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop',
        bio: profileData.bio || 'No bio provided',
        location: profileData.location || 'Unknown location',
        website: profileData.website || '',
        joinDate: 'March 2024', // Fallback
        email: profileData.email,
        isVerified: false, // Fallback
        role: 'user', // Fallback
        stats: {
          posts: profileData.posts,
          followers: profileData.followers,
          following: profileData.following,
          likes: profileData.totalLikes
        },
        socialLinks: {}, // Fallback
        preferences: {
          showEmail: false,
          allowMessages: true,
          showActivity: true
        }
      };
      setUser(mappedUser);
    }

    if (profilePosts) {
      const mappedPosts: Post[] = profilePosts.map((p: any) => {
        // Robust image resolution logic matching BlogPreviewCard
        let resolvedCoverImage = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop';
        
        if (p.coverImageData) {
          resolvedCoverImage = p.coverImageData.startsWith('data:image') 
            ? p.coverImageData 
            : `data:image/jpeg;base64,${p.coverImageData}`;
        } else if (p.coverImage) {
          resolvedCoverImage = p.coverImage.startsWith('http') 
            ? p.coverImage 
            : `http://localhost:8080${p.coverImage.startsWith('/') ? '' : '/'}${p.coverImage}`;
        } else if (p.mediaUrl) {
          resolvedCoverImage = p.mediaUrl.startsWith('http') 
            ? p.mediaUrl 
            : `http://localhost:8080${p.mediaUrl.startsWith('/') ? '' : '/'}${p.mediaUrl}`;
        }

        return {
          id: p.id ? p.id.toString() : '',
          title: p.title || 'Untitled Post',
          excerpt: p.excerpt 
            ? stripHtml(p.excerpt).substring(0, 160) + '...'
            : p.content 
              ? stripHtml(p.content).substring(0, 160) + '...' 
              : 'No content available',
          content: p.content || '',
          coverImage: resolvedCoverImage,
          category: p.category || 'General',
          tags: p.tags || [],
          publishDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent',
          readTime: '5 min read',
          stats: {
            likes: p.likesCount || 0,
            comments: p.commentsCount || 0,
            views: 0,
            isLiked: p.isLiked || false,
            isBookmarked: p.isBookmarked || false
          },
          status: p.status?.toLowerCase() || 'published'
        };
      });
      setPosts(mappedPosts);
    }
  }, [profileData, profilePosts, userId]);

  const categories = ['all', 'Reviews', 'Studio Analysis', 'Character Study'];

  // Filter and sort posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.stats.likes - a.stats.likes;
      case 'oldest':
        return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
      default: // newest
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    }
  });

  const handleSubscribe = async () => {
    if (userId && !isOwnProfile) {
      try {
        if (!isSubscribed) {
          await api.post(`/user/action/subscribe?bloggerId=${userId}`);
          setIsSubscribed(true);
        } else {
          await api.post(`/user/action/unsubscribe?bloggerId=${userId}`);
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error("Subscription action failed:", error);
      }
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? {
            ...post,
            stats: {
              ...post.stats,
              isLiked: !post.stats.isLiked,
              likes: post.stats.isLiked ? post.stats.likes - 1 : post.stats.likes + 1
            }
          }
        : post
    ));
  };

  const handleBookmarkPost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? {
            ...post,
            stats: {
              ...post.stats,
              isBookmarked: !post.stats.isBookmarked
            }
          }
        : post
    ));
  };

  const handleViewPost = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleSaveProfile = (updatedUser: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
    console.log('Saving profile:', updatedUser);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Award className="w-5 h-5 text-yellow-400" aria-label="Admin" />;
      case 'moderator':
        return <Award className="w-5 h-5 text-blue-400" aria-label="Moderator" />;
      case 'verified':
        return <Check className="w-5 h-5 text-green-400" aria-label="Verified" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        {isLoading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg font-medium text-white animate-pulse">Loading Profile...</p>
            </div>
          </div>
        )}

        {profileError && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 flex items-center space-x-3">
              <Ban className="w-5 h-5 flex-shrink-0" />
              <p>{profileError}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-50 glass-panel border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <div className="flex items-center space-x-4">
                {!isOwnProfile && (
                  <>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Bell className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </>
                )}
                
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl py-2 min-w-48">
                      {isOwnProfile ? (
                        <>
                          <button
                            onClick={() => {setShowEditModal(true); setShowUserMenu(false);}}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit Profile</span>
                          </button>
                          <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                            <Flag className="w-4 h-4" />
                            <span>Report User</span>
                          </button>
                          <button className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                            <Ban className="w-4 h-4" />
                            <span>Block User</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Profile Header */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
            {/* Cover Image */}
            <div className="relative h-48 md:h-64">
              {user.coverImage ? (
                <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-pink-500/20 to-violet-500/20" />
              )}
              <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="p-6 md:p-8">
              {/* Profile Info */}
              <div className="flex flex-col md:flex-row md:items-start md:space-x-6 -mt-16 md:-mt-20 relative">
                <div className="relative mb-4 md:mb-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/20 bg-black/50"
                  />
                  {user.role && getRoleIcon(user.role) && (
                    <div className="absolute -bottom-2 -right-2 bg-gray-900 rounded-full p-2">
                      {getRoleIcon(user.role)}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-white">{user.name}</h1>
                        {user.isVerified && (
                          <Check className="w-6 h-6 text-green-400" />
                        )}
                      </div>
                      <p className="text-gray-400 text-lg">@{user.username}</p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                      {!isOwnProfile && (
                        <>
                          <button
                            onClick={handleSubscribe}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${
                              isSubscribed
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg'
                            }`}
                          >
                            {isSubscribed ? (
                              <span className="flex items-center space-x-2">
                                <UserCheck className="w-4 h-4" />
                                <span>Subscribed</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-2">
                                <UserPlus className="w-4 h-4" />
                                <span>Subscribe</span>
                              </span>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl">{user.bio}</p>

                  {/* User Info */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-6">
                    <span className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {user.joinDate}</span>
                    </span>
                    {user.website && (
                      <a 
                        href={user.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span>{user.website.replace('https://', '')}</span>
                      </a>
                    )}
                    {user.preferences.showEmail && (
                      <span className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{user.stats.posts}</div>
                      <div className="text-sm text-gray-400">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{user.stats.followers.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{user.stats.following}</div>
                      <div className="text-sm text-gray-400">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{user.stats.likes.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Likes</div>
                    </div>
                  </div>

                  {/* Social Links */}
                  {(user.socialLinks.twitter || user.socialLinks.instagram || user.socialLinks.github) && (
                    <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-white/10">
                      {user.socialLinks.twitter && (
                        <a 
                          href={user.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {user.socialLinks.instagram && (
                        <a 
                          href={user.socialLinks.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 rounded-lg transition-all"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {user.socialLinks.github && (
                        <a 
                          href={user.socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="mt-8">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex space-x-1 bg-white/10 rounded-xl p-1">
                {[
                  { id: 'posts', label: 'Posts', icon: FileText, count: user.stats.posts },
                  { id: 'activity', label: 'Activity', icon: TrendingUp, count: activity.length },
                  { id: 'about', label: 'About', icon: Users }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'posts' && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'grid' ? 'text-pink-400 bg-pink-500/20' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'list' ? 'text-pink-400 bg-pink-500/20' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            {activeTab === 'posts' && (
              <div>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
                      />
                    </div>

                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-pink-400"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-gray-800">
                          {cat === 'all' ? 'All Categories' : cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-pink-400"
                  >
                    <option value="newest" className="bg-gray-800">Newest First</option>
                    <option value="popular" className="bg-gray-800">Most Popular</option>
                    <option value="oldest" className="bg-gray-800">Oldest First</option>
                  </select>
                </div>

                {/* Posts Grid/List */}
                {isPostsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400">Loading posts...</p>
                  </div>
                ) : postsError ? (
                  <div className="text-center py-16 bg-red-500/5 rounded-2xl border border-red-500/10">
                    <Ban className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Error loading posts</h3>
                    <p className="text-gray-400">{postsError}</p>
                  </div>
                ) : sortedPosts.length === 0 ? (
                  <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
                    <p className="text-gray-400">
                      {searchTerm || filterCategory !== 'all' 
                        ? "Try adjusting your search or filter criteria." 
                        : `${isOwnProfile ? "You haven't" : "This user hasn't"} published any posts yet.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                    : "space-y-6"
                  }>
                    {sortedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        viewMode={viewMode}
                        onLike={handleLikePost}
                        onBookmark={handleBookmarkPost}
                        onView={handleViewPost}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && user.preferences.showActivity && (
              <div className="space-y-4">
                {activity.length === 0 ? (
                  <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No recent activity</h3>
                    <p className="text-gray-400">Activity will appear here as the user interacts with posts</p>
                  </div>
                ) : (
                  activity.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                      <div className="p-2 bg-pink-500/20 rounded-lg">
                        {item.type === 'post' && <FileText className="w-4 h-4 text-pink-400" />}
                        {item.type === 'like' && <Heart className="w-4 h-4 text-red-400" />}
                        {item.type === 'comment' && <MessageCircle className="w-4 h-4 text-blue-400" />}
                        {item.type === 'follow' && <UserPlus className="w-4 h-4 text-green-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-300">{item.content}</p>
                        <p className="text-gray-500 text-sm mt-1">{item.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">About</h3>
                  <div className="space-y-4 text-gray-300">
                    <p className="leading-relaxed">{user.bio}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div>
                        <h4 className="font-medium text-white mb-2">Location</h4>
                        <p className="text-gray-400">{user.location}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-2">Joined</h4>
                        <p className="text-gray-400">{user.joinDate}</p>
                      </div>
                      {user.website && (
                        <div className="sm:col-span-2">
                          <h4 className="font-medium text-white mb-2">Website</h4>
                          <a 
                            href={user.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-pink-400 hover:text-pink-300 transition-colors"
                          >
                            {user.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-400">Posts Published</span>
                      <span className="text-white font-medium">{user.stats.posts}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-400">Total Likes Received</span>
                      <span className="text-white font-medium">{user.stats.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-400">Followers</span>
                      <span className="text-white font-medium">{user.stats.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-gray-400">Following</span>
                      <span className="text-white font-medium">{user.stats.following}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        user={user}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default UserProfilePage;