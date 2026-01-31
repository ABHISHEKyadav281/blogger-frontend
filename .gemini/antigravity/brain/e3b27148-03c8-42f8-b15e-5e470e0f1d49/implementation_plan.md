# Fix post click navigation and detailed view

## Goal Description
The user reported that clicking on a particular post card does not navigate to the detailed post view. The fix requires ensuring that the click handler correctly navigates, that the route is set up, and that a functional `BlogPostDetail` component exists to fetch and display the post.

## Proposed Changes

### src/components/blog/BlogPostDetail.tsx
- Replaced the previously commented-out placeholder with a full implementation.
- Added imports for React, routing, icons, Redux hooks, and actions.
- Implemented fetching of a post by ID using `fetchPostById`.
- Added loading and error handling UI.
- Created helper `getImageSource` for image fallback.
- Implemented action handlers for like, bookmark, subscribe, and share.
- Rendered detailed post UI with hero image, author info, content, tags, and action bar.

### src/components/blog/BlogPreviewCard.tsx (no code change needed)
- The existing `handleCardClick` already navigates to `/post/${post.id}` and prevents propagation on interactive elements.

### src/layout/AppRoutes.tsx (no code change needed)
- The route `/post/:postId` already points to `BlogPostDetail`.

## Verification Plan
- Run the development server (`npm run dev`).
- Navigate to the home page, click on a post card, and verify that the detailed view loads with correct data.
- Test loading, error, and UI interactions (like, bookmark, subscribe, share).
- Ensure navigation back works.
