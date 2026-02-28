import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./Layout";

import HomePage from "../pages/HomePage";
import BlogPostDetail from "../components/blog/BlogPostDetail";
import CreatePost from "../components/createPost/CreatePost";
import UserProfilePage from "../pages/UserProfilePage";
import SearchResultsPage from "../pages/SearchResultsPage";
import AuthPage from "../pages/AuthPage";
import { ProtectedRoute, PublicRoute } from "./ProtectedRotes";
import CreatePostPage from "../pages/CreatePost";
import MyBookmarksPage from "../pages/MyBookmarksPage";
import MyFollowsPage from "../pages/MyFollowsPage";
import MyBlogsPage from "../pages/MyBlogsPage";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { loginSuccess, logout } from "../redux/slices/authSlice";
import { useAppDispatch } from "../redux/slices/hooks";

interface TokenPayload {
  userId: string;
  sub: string;
  email: string;
  exp: number;
}

export const AppRoutes = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("soloblogger_token");
    if (token) {
      try {
        const decoded: TokenPayload = jwtDecode(token);

        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          dispatch(logout());
          return;
        }

        // Restore user session
        dispatch(
          loginSuccess({
            user: {
              id: decoded.userId,
              username: decoded.sub || "",
              email: decoded.email,
              name: "",
              avatar: "",
              isVerified: false,
              role: 'user',
              stats: { posts: 0, followers: 0, following: 0 }
            },
            token,
          })
        );
      } catch (error) {
        console.error("Invalid token:", error);
        dispatch(logout());
      }
    }
  }, [dispatch]);
  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      {/* Protected routes wrapped in Layout */}
      <Route element={<Layout />}>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post/:postId"
          element={
            <ProtectedRoute>
              <BlogPostDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId?"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <MyBookmarksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/follows"
          element={
            <ProtectedRoute>
              <MyFollowsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-blogs"
          element={
            <ProtectedRoute>
              <MyBlogsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchResultsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/createPost"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};
