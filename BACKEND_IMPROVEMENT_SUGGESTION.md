# Backend Improvement: Support Slugs in Like API

## Current Issue
The like API currently only accepts MongoDB ObjectIds (`/api/likes/:newsId`), but articles are typically accessed by slug in the frontend. This requires an additional API call to resolve slug to ID.

## Suggested Solution
Modify the like controller to support both ObjectId and slug, similar to how the news controller works.

## Implementation

### 1. Update likeController.mjs

```javascript
// Add this helper function at the top of likeController.mjs
const findNewsByIdentifier = async (identifier) => {
  let query;
  
  // Check if the identifier is a valid MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    query = { _id: identifier };
  } else {
    query = { slug: identifier };
  }
  
  const news = await News.findOne(query);
  return news;
};

// Update all like functions to use this helper
const likeNews = asyncHandler(async (req, res) => {
  const { newsId } = req.params;
  const userId = req.user._id;

  // Use the helper function
  const news = await findNewsByIdentifier(newsId);
  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  // Use news._id for the like record
  const existingLike = await Like.findOne({ user: userId, news: news._id });
  if (existingLike) {
    res.status(400);
    throw new Error('You have already liked this article');
  }

  const like = await Like.create({
    user: userId,
    news: news._id
  });

  // ... rest of the function
});

// Apply similar changes to:
// - unlikeNews
// - toggleLike
// - getLikeCount
// - checkUserLike
// - getLikeStatus
// - getLikeStatusPublic
```

### 2. Update API Routes (Optional)
You could also update the route parameter name to be more generic:

```javascript
// In routes/likes.mjs
router.post('/:identifier/toggle', protect, toggleLike);
router.get('/:identifier/count', getLikeCount);
router.get('/:identifier/status', protect, getLikeStatus);
// etc.
```

## Benefits
1. **Eliminates extra API calls** - No need to resolve slug to ID
2. **Better performance** - One less network request per like operation
3. **Consistent API design** - Matches the news API pattern
4. **Backward compatibility** - Still works with ObjectIds

## Frontend Changes Required
After implementing this backend change, update the frontend:

1. Remove the `articleResolver.ts` file
2. Update `useArticleLikes.ts` to use slug directly
3. Update the like API calls to use slug instead of ID

## Example Frontend Usage After Backend Update

```typescript
// Instead of resolving slug to ID first
const { likeCount, isLiked, toggleLike } = useArticleLikes({
  articleSlug: article.slug[locale] || article.slug.en,
  locale
});
```

This would make the like functionality more efficient and consistent with the rest of the API.
