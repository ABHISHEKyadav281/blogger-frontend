import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/slices/hooks';
import { fetchBookmarkedPosts } from '../redux/slices/postsListSlice';
import BlogPreviewCard from '../components/blog/BlogPreviewCard';
import { Loader2, Bookmark, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyBookmarksPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { posts, isLoading, error } = useAppSelector((state) => state.postsList);

    useEffect(() => {
        dispatch(fetchBookmarkedPosts({}));
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
            <div className="w-full px-4 lg:px-8">
                <div className="flex items-center space-x-4 mb-8">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-yellow-500/20 rounded-xl">
                            <Bookmark className="w-6 h-6 text-yellow-500" />
                        </div>
                        <h1 className="text-3xl font-bold">My Bookmarks</h1>
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
                        <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-white mb-2">No bookmarks yet</h3>
                        <p>Posts you bookmark will appear here for easy access.</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                        >
                            Explore Posts
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
        </div>
    );
};

export default MyBookmarksPage;
