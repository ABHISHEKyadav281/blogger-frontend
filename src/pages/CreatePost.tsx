import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Eye, Send, Calendar, Globe, Lock, Users,
  AlertCircle, X, FileText, Settings, Sparkles, Trash2, Upload
} from 'lucide-react';
import axios from 'axios';
import RichTextEditor from '../components/createPost/RichTextEditor';
import PostPreview from '../components/createPost/PostPreview';

interface PostData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS';
  publishDate?: string;
  allowComments: boolean;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

const categories: Category[] = [
  { id: 'Anime Reviews', name: 'Anime Reviews', description: 'In-depth anime series and movie reviews', color: 'from-pink-500 to-red-500' },
  { id: 'Manga Discussion', name: 'Manga Discussion', description: 'Manga analysis and discussions', color: 'from-blue-500 to-cyan-500' },
  { id: 'Character Analysis', name: 'Character Analysis', description: 'Deep dives into character development', color: 'from-purple-500 to-violet-500' },
  { id: 'Industry News', name: 'Industry News', description: 'Latest anime industry updates', color: 'from-green-500 to-emerald-500' },
  { id: 'Studio Spotlights', name: 'Studio Spotlights', description: 'Focusing on animation studios', color: 'from-yellow-500 to-orange-500' },
  { id: 'Technical Analysis', name: 'Technical Analysis', description: 'Animation and production breakdowns', color: 'from-indigo-500 to-blue-600' }
];

const popularTags = [
  'AttackOnTitan', 'OnePiece', 'DemonSlayer', 'JujutsuKaisen', 'MyHeroAcademia',
  'Naruto', 'DragonBall', 'StudioGhibli', 'MAPPA', 'WITStudio', 'Toei',
  'Shonen', 'Seinen', 'Shoujo', 'Isekai', 'Mecha', 'Romance', 'Action',
  'Comedy', 'Drama', 'Thriller', 'Horror', 'Slice of Life'
];

const CreatePost: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'write' | 'preview' | 'settings'>('write');
  const [postData, setPostData] = useState<PostData>({
    title: '', content: '', excerpt: '', category: '',
    tags: [], status: 'DRAFT', visibility: 'PUBLIC',
    allowComments: true, featured: false
  });
  
  // File upload states
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  const [newTag, setNewTag] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const hasContent = postData.title.trim() || postData.content.trim() || coverImageFile !== null;
    setHasUnsavedChanges(hasContent);
  }, [postData, coverImageFile]);

  const tagSuggestions = popularTags.filter(tag => 
    tag.toLowerCase().includes(newTag.toLowerCase()) && !postData.tags.includes(tag)
  );

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, or WEBP)');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setCoverImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected file
  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
    if (status === 'DRAFT') setSaving(true);
    else setPublishing(true);

    try {
      // Validation for published posts
      if (status === 'PUBLISHED') {
        if (!postData.title.trim()) { 
          alert('Please enter a title'); 
          return; 
        }
        if (!postData.content.trim()) { 
          alert('Please enter content'); 
          return; 
        }
        if (!postData.category) { 
          alert('Please select a category'); 
          return; 
        }
      }

      // Create FormData
      const formData = new FormData();
      
      // Append all text fields (field names MUST match DTO property names)
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      formData.append('category', postData.category);
      formData.append('status', status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
      formData.append('visibility', postData.visibility);
      formData.append('allowComments', String(postData.allowComments));
      formData.append('featured', String(postData.featured));
      
      // Append optional fields
      if (postData.excerpt && postData.excerpt.trim()) {
        formData.append('excerpt', postData.excerpt);
      }
      
      // Append tags array - each tag separately
      if (postData.tags && postData.tags.length > 0) {
        postData.tags.forEach(tag => {
          formData.append('tags', tag);
        });
      }
      
      // Append file if selected (field name must match DTO: 'coverImage')
      if (coverImageFile) {
        formData.append('coverImage', coverImageFile);
      }

      // Get auth token
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');

      console.log('Sending request...');
      console.log('Title:', postData.title);
      console.log('Category:', postData.category);
      console.log('Status:', status);
      console.log('Has file:', !!coverImageFile);

      // Send request
      const response = await axios.post(
        'http://localhost:8080/post/v1/createPost',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      );

      console.log('Post saved successfully:', response.data);
      
      setHasUnsavedChanges(false);
      
      if (status === 'PUBLISHED') {
        alert('Post published successfully! 🎉');
      } else {
        alert('Draft saved! 💾');
      }

      // Optionally redirect to posts list
      // window.location.href = '/posts';
      
    } catch (error: any) {
      console.error('Error saving post:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save post';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !postData.tags.includes(tag.trim())) {
      setPostData(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }));
    }
    setNewTag('');
    setShowTagSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    setPostData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const isFormValid = postData.title.trim() && postData.content.trim() && postData.category;
  const handleExitWithoutSaving = () => { setShowExitModal(false); window.history.back(); };
  const handleSaveAndExit = async () => { await handleSave('DRAFT'); window.history.back(); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button onClick={() => hasUnsavedChanges ? setShowExitModal(true) : window.history.back()}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Create New Post</h1>
                    <p className="text-gray-400 text-sm">Share your anime insights with the community</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${saving ? 'bg-yellow-400' : publishing ? 'bg-green-400' : hasUnsavedChanges ? 'bg-orange-400' : 'bg-gray-400'}`} />
                  <span className="text-gray-400">
                    {saving ? 'Saving...' : publishing ? 'Publishing...' : hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
                  </span>
                </div>

                <button onClick={() => handleSave('DRAFT')} disabled={saving || publishing || !hasUnsavedChanges}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Draft'}</span>
                </button>

                <button onClick={() => handleSave('PUBLISHED')} disabled={!isFormValid || saving || publishing}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="w-4 h-4" />
                  <span>{publishing ? 'Publishing...' : 'Publish'}</span>
                </button>
              </div>
            </div>
            
            <div className="flex space-x-1 mt-4 bg-white/5 rounded-xl p-1 w-fit">
              {[
                { id: 'write', label: 'Write', icon: FileText },
                { id: 'preview', label: 'Preview', icon: Eye },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button key={tab.id} onClick={() => setCurrentTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    currentTab === tab.id ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}>
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {currentTab === 'write' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-6">
                <div>
                  <input type="text" placeholder="Enter your post title..." value={postData.title}
                    onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-3xl font-bold bg-transparent text-white placeholder-gray-400 focus:outline-none border-none" />
                </div>
                
                <div>
                  <textarea placeholder="Write a compelling excerpt (optional)..." value={postData.excerpt}
                    onChange={(e) => setPostData(prev => ({ ...prev, excerpt: e.target.value }))} rows={3}
                    className="w-full text-lg bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 resize-none" />
                </div>

                <RichTextEditor content={postData.content}
                  onChange={(content) => setPostData(prev => ({ ...prev, content }))} />

                {/* Tags Section - Moved from Sidebar */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                  
                  {postData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {postData.tags.map((tag, index) => (
                        <span key={index} className="flex items-center space-x-1 bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-sm">
                          <span>#{tag}</span>
                          <button onClick={() => removeTag(tag)} className="text-pink-400 hover:text-pink-300">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <input type="text" placeholder="Add tags..." value={newTag}
                      onChange={(e) => { setNewTag(e.target.value); setShowTagSuggestions(e.target.value.length > 0); }}
                      onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(newTag); } }}
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400" />

                    {showTagSuggestions && tagSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl max-h-48 overflow-y-auto z-10">
                        {tagSuggestions.slice(0, 10).map((tag) => (
                          <button key={tag} onClick={() => addTag(tag)}
                            className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all first:rounded-t-xl last:rounded-b-xl">
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Popular tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.slice(0, 8).map((tag) => (
                        <button key={tag} onClick={() => addTag(tag)} disabled={postData.tags.includes(tag)}
                          className="px-2 py-1 bg-white/5 hover:bg-pink-500/20 text-gray-400 hover:text-pink-300 rounded text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Cover Image Upload Section */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Cover Image</h3>
                  
                  {!coverImagePreview ? (
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-pink-400 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="cover-image-upload"
                      />
                      <label
                        htmlFor="cover-image-upload"
                        className="cursor-pointer flex flex-col items-center space-y-3"
                      >
                        <div className="p-4 bg-pink-500/20 rounded-full">
                          <Upload className="w-8 h-8 text-pink-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Upload Cover Image</p>
                          <p className="text-sm text-gray-400 mt-1">
                            JPG, PNG, GIF or WEBP (Max 10MB)
                          </p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <img
                          src={coverImagePreview}
                          alt="Cover preview"
                          className="w-full h-48 object-cover rounded-xl"
                        />
                        <button
                          onClick={removeCoverImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {coverImageFile && (
                        <div className="text-sm text-gray-400 space-y-1">
                          <p className="truncate font-medium">{coverImageFile.name}</p>
                          <p className="text-xs">{(coverImageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Category *</h3>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <label key={category.id}
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                          postData.category === category.id ? 'bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30' : 'bg-white/5 hover:bg-white/10 border border-white/10'
                        }`}>
                        <input type="radio" name="category" value={category.id} checked={postData.category === category.id}
                          onChange={(e) => setPostData(prev => ({ ...prev, category: e.target.value }))} className="sr-only" />
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.color} mr-3`} />
                        <div>
                          <div className="font-medium text-white">{category.name}</div>
                          <div className="text-sm text-gray-400">{category.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'preview' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Post Preview</h2>
                <p className="text-gray-400">This is how your post will appear to readers</p>
              </div>
              <PostPreview postData={{...postData, coverImage: coverImagePreview || ''}} />
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Post Settings</h2>
                <p className="text-gray-400">Configure publishing options and visibility</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Publishing</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-3">Status</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'DRAFT', label: 'Draft', desc: 'Only visible to you', icon: FileText },
                        { value: 'PUBLISHED', label: 'Published', desc: 'Live for everyone', icon: Globe },
                        { value: 'SCHEDULED', label: 'Scheduled', desc: 'Publish later', icon: Calendar }
                      ].map((status) => (
                        <label key={status.value}
                          className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all ${
                            postData.status === status.value ? 'bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30' : 'bg-white/5 hover:bg-white/10 border border-white/10'
                          }`}>
                          <input type="radio" name="status" value={status.value} checked={postData.status === status.value}
                            onChange={(e) => setPostData(prev => ({ ...prev, status: e.target.value as any }))} className="sr-only" />
                          <status.icon className="w-6 h-6 text-pink-400 mb-2" />
                          <span className="font-medium text-white">{status.label}</span>
                          <span className="text-xs text-gray-400">{status.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-3">Visibility</label>
                    <div className="space-y-3">
                      {[
                        { value: 'PUBLIC', label: 'Public', desc: 'Anyone can read this post', icon: Globe },
                        { value: 'FOLLOWERS', label: 'Followers Only', desc: 'Only your followers can read', icon: Users },
                        { value: 'PRIVATE', label: 'Private', desc: 'Only you can read this post', icon: Lock }
                      ].map((visibility) => (
                        <label key={visibility.value}
                          className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                            postData.visibility === visibility.value ? 'bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30' : 'bg-white/5 hover:bg-white/10 border border-white/10'
                          }`}>
                          <input type="radio" name="visibility" value={visibility.value} checked={postData.visibility === visibility.value}
                            onChange={(e) => setPostData(prev => ({ ...prev, visibility: e.target.value as any }))} className="sr-only" />
                          <visibility.icon className="w-5 h-5 text-pink-400 mr-3" />
                          <div>
                            <div className="font-medium text-white">{visibility.label}</div>
                            <div className="text-sm text-gray-400">{visibility.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Interaction</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <div className="font-medium text-white">Allow Comments</div>
                      <div className="text-sm text-gray-400">Readers can comment on this post</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={postData.allowComments}
                        onChange={(e) => setPostData(prev => ({ ...prev, allowComments: e.target.checked }))} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <div className="font-medium text-white">Featured Post</div>
                      <div className="text-sm text-gray-400">Show this post prominently on your profile</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={postData.featured}
                        onChange={(e) => setPostData(prev => ({ ...prev, featured: e.target.checked }))} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Unsaved Changes</h3>
            </div>
            <p className="text-gray-300 mb-6">You have unsaved changes. What would you like to do?</p>
            <div className="flex flex-col space-y-3">
              <button onClick={handleSaveAndExit} disabled={saving}
                className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Draft & Exit'}</span>
              </button>
              <button onClick={handleExitWithoutSaving}
                className="flex items-center justify-center space-x-2 p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl transition-all">
                <X className="w-4 h-4" />
                <span>Exit Without Saving</span>
              </button>
              <button onClick={() => setShowExitModal(false)}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all">
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50">
        {(saving || publishing) && (
          <div className="bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 p-4 flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-white">
              {saving ? 'Saving draft...' : 'Publishing post...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePost;