import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/slices/hooks';
import { fetchUserPosts } from '../redux/slices/postsListSlice';
import BlogPreviewCard from '../components/blog/BlogPreviewCard';
import { Loader2, PenTool, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyBlogsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { posts, isLoading, error } = useAppSelector((state) => state.postsList);
    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchUserPosts({ userId: Number(user.id) }));
        }
    }, [dispatch, user?.id]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-pink-500/20 rounded-2xl">
            <PenTool className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Blogs</h1>
            <p className="text-gray-400">Manage and edit your published articles</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all group"
          >
            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-white/10 transition-all border border-white/10">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back</span>
          </button>
          
          <button
            onClick={() => navigate('/createPost')}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
          >
            Create New Post
          </button>
        </div>
      </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 p-8 bg-white/5 rounded-2xl border border-white/10">
                        {error}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-gray-400 p-12 bg-white/5 rounded-2xl border border-white/10">
                        <PenTool className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-white mb-2">No blogs yet</h3>
                        <p>Start writing your thoughts and share them with the world.</p>
                        <button 
                            onClick={() => navigate('/createPost')}
                            className="mt-6 px-6 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors text-white"
                        >
                            Create First Post
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <BlogPreviewCard
                                key={post.id}
                                post={post}
                            />
                        ))}
                    </div>
                )}
            </div>
    );
};

export default MyBlogsPage;
