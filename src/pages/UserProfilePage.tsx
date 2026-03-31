import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/slices/hooks';
import { fetchUserDetails, fetchUserPosts, modifyUserDetails, type UserDetailsReqDto } from '../redux/slices/userProfileSlice';
import { logout } from '../redux/slices/authSlice';
import api from '../utils/api';
import { API_BASE_URL } from '../config';
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
  Check,
  LogOut
} from 'lucide-react';
import ImageModal from '../components/ui/ImageModal';

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
  onView: (id: string) => void;
}> = ({ post, viewMode, onView }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02] cursor-pointer"
           onClick={() => onView(post.id)}>
        <div className="flex">
          <img 
            src={post.coverImage.startsWith('http') ? post.coverImage : `${API_BASE_URL}${post.coverImage.startsWith('/') ? '' : '/'}${post.coverImage}`} 
            alt={post.title}
            className="w-48 h-32 object-cover flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop';
            }}
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
        src={post.coverImage.startsWith('http') ? post.coverImage : `${API_BASE_URL}${post.coverImage.startsWith('/') ? '' : '/'}${post.coverImage}`} 
        alt={post.title}
        className="w-full h-40 object-cover"
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop';
        }}
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
  onSave: (updatedUser: User) => Promise<void> | void;
}> = ({ user, isOpen, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState(user);
  const [activeTab, setActiveTab] = useState<'profile' | 'social' | 'privacy'>('profile');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEditedUser(user);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editedUser);
    onClose();
  };

  const validateFile = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const maxSize = 10 * 1024 * 1024; // 10MB

    const isAllowedType = allowedTypes.includes(file.type);
    const isAllowedExtension = fileExtension ? allowedExtensions.includes(fileExtension) : false;

    if (!isAllowedType || !isAllowedExtension) {
      alert(`Invalid file: ${file.name}. Only JPG, PNG, GIF, and WEBP are allowed. AVIF and other formats are strictly prohibited.`);
      return false;
    }

    if (file.size > maxSize) {
      alert(`File size too large: ${file.name}. Maximum size is 10MB.`);
      return false;
    }
    return true;
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedUser(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedUser(prev => ({ ...prev, coverImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black/90 backdrop-blur-xl rounded-3xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs - Commented out for now
          <div className="flex space-x-1 mt-4 bg-white/5 rounded-xl p-1 overflow-x-auto scrollbar-hide w-full">
            {[
              { id: 'profile', label: 'Profile', icon: Users },
              { id: 'social', label: 'Social Links', icon: LinkIcon },
              { id: 'privacy', label: 'Privacy', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all flex-1 md:flex-none justify-center whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="hidden sm:block w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
          */}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Avatar */}
              <div>
                <label className="block text-white font-medium mb-3">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={editedUser.avatar.startsWith('http') || editedUser.avatar.startsWith('data:image') ? editedUser.avatar : `${API_BASE_URL}${editedUser.avatar.startsWith('/') ? '' : '/'}${editedUser.avatar}`}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full border-4 border-white/20"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150';
                      }}
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
  // const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

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
      console.log('👤 Profile Data Received:', profileData);
      
      const mappedUser: User = {
        id: profileData.id || userId || '',
        name: profileData.firstName && profileData.lastName 
          ? `${profileData.firstName} ${profileData.lastName}` 
          : (profileData.name || profileData.username),
        username: profileData.username,
        avatar: profileData.profileImage || `https://ui-avatars.com/api/?name=${profileData.username}&background=random`,
        coverImage: profileData.coverImage || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        joinDate: 'March 2024', // Fallback
        email: profileData.email,
        isVerified: false, // Fallback
        role: 'user', // Fallback
        stats: {
          posts: profileData.posts ?? profileData.postCount ?? 0,
          followers: profileData.followers ?? profileData.followerCount ?? profileData.followersCount ?? 0,
          following: profileData.following ?? profileData.followingCount ?? 0,
          likes: profileData.totalLikes ?? profileData.likes ?? 0
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
            : `${API_BASE_URL}${p.coverImage.startsWith('/') ? '' : '/'}${p.coverImage}`;
        } else if (p.mediaUrl) {
          resolvedCoverImage = p.mediaUrl.startsWith('http') 
            ? p.mediaUrl 
            : `${API_BASE_URL}${p.mediaUrl.startsWith('/') ? '' : '/'}${p.mediaUrl}`;
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

  const categories = ['all', 'Anime Reviews', 'Manga Discussion', 'Character Analysis'];

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
      // Optimistic update
      const wasSubscribed = isSubscribed;
      setIsSubscribed(!wasSubscribed);
      
      // Update follower count dynamically
      if (user) {
        setUser({
          ...user,
          stats: {
            ...user.stats,
            followers: wasSubscribed 
              ? Math.max(0, user.stats.followers - 1) 
              : user.stats.followers + 1
          }
        });
      }

      try {
        if (!wasSubscribed) {
          await api.post(`/user/action/subscribe?bloggerId=${userId}`);
        } else {
          await api.post(`/user/action/unsubscribe?bloggerId=${userId}`);
        }
      } catch (error) {
        console.error("Subscription action failed:", error);
        // Revert on error
        setIsSubscribed(wasSubscribed);
        if (user) {
          setUser({
            ...user,
            stats: {
              ...user.stats,
              followers: wasSubscribed 
                ? user.stats.followers 
                : Math.max(0, user.stats.followers - 1)
            }
          });
        }
      }
    }
  };

  const handleViewPost = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleEditProfileClick = async () => {
    setShowUserMenu(false);
    if (user?.id) {
      try {
        await dispatch(fetchUserDetails(user.id)).unwrap();
      } catch (error) {
        console.error('Failed to prefetch user info:', error);
      }
    }
    setShowEditModal(true);
  };

  const handleSaveProfile = async (updatedUser: User) => {
    console.log('💾 handleSaveProfile initiated with:', updatedUser);
    try {
      const updateDto: UserDetailsReqDto = {
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicUrl: updatedUser.avatar,
        bio: updatedUser.bio || ''
      };

      console.log('📡 Calling modifyUserDetails thunk with DTO:', updateDto);
      const result = await dispatch(modifyUserDetails(updateDto)).unwrap();
      console.log('✅ Profile updated successfully:', result);
      
      // Update local state if needed
      setUser(prev => ({ ...prev, ...updatedUser }));
      setShowEditModal(false); // Close modal only on success
    } catch (err) {
      console.error('❌ Failed to update profile:', err);
      // You could show an error toast here
    }
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
      <div className="max-w-7xl mx-auto pb-24 md:pb-8">
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
          <div className="fixed top-6 right-4 md:top-8 md:right-8 z-[100] w-full max-w-sm">
            <div className="flex items-start space-x-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-right-8 duration-300 bg-rose-500/10 border-rose-500/20">
              <div className="flex-shrink-0 mt-0.5">
                <Ban className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white">Error</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{profileError}</p>
              </div>
            </div>
          </div>
        )}


        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-10 mb-8 relative">
            
            {/* Top Left Back Button (Non-Mobile) */}
            <button 
              onClick={() => navigate(-1)}
              className="hidden sm:flex absolute top-6 left-6 z-20 items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all font-medium border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Top Right Menu */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
              <div className="relative group/menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl py-2 min-w-48 animate-in fade-in zoom-in-95 duration-200">
                    {isOwnProfile ? (
                      <>
                        <button
                          onClick={handleEditProfileClick}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="text-sm">Edit Profile</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium border-t border-white/5 mt-1 pt-3">
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Settings</span>
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border-t border-white/5 mt-1 pt-3 font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium">
                          <Flag className="w-4 h-4" />
                          <span className="text-sm">Report User</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border-t border-white/5 mt-1 pt-3 font-medium">
                          <Ban className="w-4 h-4" />
                          <span className="text-sm">Block User</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 md:gap-16 items-center sm:items-start max-w-4xl mx-auto">
              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                <img
                  src={user.avatar.startsWith('http') || user.avatar.startsWith('data:image') ? user.avatar : `${API_BASE_URL}${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`}
                  alt={user.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full border border-white/20 bg-black/50 p-1"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150';
                  }}
                />
                {user.role && getRoleIcon(user.role) && (
                  <div className="absolute bottom-2 right-2 bg-gray-900 rounded-full p-2 border border-white/10 shadow-xl">
                    {getRoleIcon(user.role)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 w-full flex flex-col items-center sm:items-start sm:min-h-[160px]">
                {/* Row 1: Username & Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-normal text-white">{user.name || user.username}</h2>
                    {user.isVerified && <Check className="w-5 h-5 text-blue-400" />}
                  </div>

                  <div className="flex items-center gap-3">
                    {!isOwnProfile && (
                        <button
                          onClick={handleSubscribe}
                          className={`px-6 py-1.5 rounded-lg font-semibold transition-all text-sm ${
                            isSubscribed
                              ? 'bg-white/10 text-white hover:bg-white/20'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {isSubscribed ? 'Following' : 'Follow'}
                        </button>
                    )}
                  </div>
                </div>

                {/* Row 2: Stats */}
                <div className="flex justify-center sm:justify-start gap-8 sm:gap-10 mb-6 w-full border-y border-white/10 py-4 sm:border-none sm:py-0">
                  <div className="flex flex-col sm:flex-row items-center gap-1">
                    <span className="font-semibold text-white">{user.stats.posts}</span>
                    <span className="text-gray-300 text-sm sm:text-base">posts</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-1">
                    <span className="font-semibold text-white">{user.stats.followers.toLocaleString()}</span>
                    <span className="text-gray-300 text-sm sm:text-base">{user.stats.followers === 1 ? 'follower' : 'followers'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-1">
                    <span className="font-semibold text-white">{user.stats.following}</span>
                    <span className="text-gray-300 text-sm sm:text-base">following</span>
                  </div>
                </div>

                {/* Row 3: Name & Bio */}
                <div className="text-center sm:text-left w-full space-y-1 mb-6">
                  <div className="font-semibold text-gray-300 text-[15px]">@{user.username}</div>
                  {user.bio && (
                    <p className="text-gray-100 text-[15px] whitespace-pre-wrap leading-tight mt-1">{user.bio}</p>
                  )}
                  
                  {/* Additional Info / Links */}
                  {user.website && (
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-3 gap-y-1 mt-2 text-sm">
                      <a 
                        href={user.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-[#e0f1ff] hover:text-white transition-colors font-semibold"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>{user.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    </div>
                  )}
                  
                  {/* Social Links */}
                  {(user.socialLinks.twitter || user.socialLinks.instagram || user.socialLinks.github) && (
                    <div className="flex justify-center sm:justify-start items-center space-x-4 pt-3">
                      {user.socialLinks.twitter && (
                        <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {user.socialLinks.instagram && (
                        <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {user.socialLinks.github && (
                        <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex space-x-1 bg-white/10 rounded-xl p-1 w-full md:w-auto overflow-x-auto justify-between scrollbar-hide">
                {[
                  { id: 'posts', label: 'Posts', icon: FileText, count: user.stats.posts },
                  // { id: 'activity', label: 'Activity', icon: TrendingUp, count: activity.length },
                  { id: 'about', label: 'About', icon: Users }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 sm:px-6 py-3 rounded-lg transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <tab.icon className="hidden sm:block w-4 h-4" />
                    <span className="text-sm sm:text-base">{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'posts' && (
                <div className="hidden sm:flex items-center space-x-4">
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 p-4 sm:p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-auto pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400"
                      />
                    </div>

                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full sm:w-auto px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-pink-400"
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

      <EditProfileModal
        user={user}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
      />
    </div>
    </div>
  );
};

export default UserProfilePage;