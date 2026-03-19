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
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-500/20 rounded-2xl">
                        <Bookmark className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Bookmarks</h1>
                        <p className="text-gray-400">Your saved posts for later reading</p>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/')}
                    className="hidden md:flex items-center space-x-2 text-gray-400 hover:text-white transition-all group"
                >
                    <div className="p-2 bg-white/5 rounded-xl group-hover:bg-white/10 transition-all border border-white/10">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Back to Home</span>
                </button>
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
    );
};

export default MyBookmarksPage;
