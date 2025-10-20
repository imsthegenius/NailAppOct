# Nail App - Supabase Database Setup

This directory contains all the SQL files needed to set up the complete database architecture for the Nail App. The database is designed to support a mobile-only nail try-on application with AI-powered transformations, user collections, and social features.

## 🗄️ Database Architecture Overview

The database supports:
- **User management** with personalization preferences
- **AI nail transformations** with metadata tracking
- **Color catalog** with trending and recommendation systems
- **User favorites and collections** for organization
- **Social features** with public sharing
- **Analytics tracking** for insights and personalization
- **Storage management** for images and assets

## 📋 Setup Instructions

### Prerequisites
1. A Supabase project created at [supabase.com](https://supabase.com)
2. Access to the Supabase SQL Editor in your project dashboard

### Step-by-Step Setup

Run these SQL files **in order** through your Supabase SQL Editor:

#### 1. Create Database Schema
```sql
-- File: 01_schema.sql
-- Creates all tables with proper constraints and relationships
```
**What it creates:**
- `users` - User profiles with personalization preferences
- `colors` - Master catalog of nail polish colors
- `nail_tries` - Individual nail transformation attempts
- `favorites` - User's saved transformations
- `collections` - User-created mood boards/collections
- `collection_items` - Items within collections
- `trending_colors` - Historical trending data
- `user_analytics` - Behavior tracking for personalization
- `notification_settings` - User notification preferences

#### 2. Configure Security Policies
```sql
-- File: 02_rls_policies.sql
-- Enables Row Level Security and creates access policies
```
**What it configures:**
- RLS policies for secure data access
- Anonymous user support for guest functionality
- Public content sharing capabilities
- Admin-only access for system data

#### 3. Setup Storage Buckets
```sql
-- File: 03_storage.sql
-- Configures Supabase Storage for image handling
```
**What it creates:**
- `user-uploads` (private, 5MB) - Original hand photos
- `transformed-images` (public, 10MB) - AI-transformed results
- `avatars` (public, 2MB) - User profile pictures
- `collection-covers` (public, 3MB) - Collection thumbnails

#### 4. Create Functions and Triggers
```sql
-- File: 04_functions.sql
-- Database functions for business logic and automation
```
**What it includes:**
- Auto-updating `updated_at` timestamps
- Trending score calculations
- User statistics aggregation
- Cleanup functions for data maintenance
- Personalized color recommendations
- Analytics event tracking

#### 5. Add Performance Indexes
```sql
-- File: 05_indexes.sql
-- Optimizes database performance for common queries
```
**What it optimizes:**
- User lookups and authentication
- Color browsing and filtering
- Trending calculations
- Collection management
- Analytics queries
- Full-text search capabilities

#### 6. Insert Initial Data
```sql
-- File: 06_seed_data.sql
-- Populate database with initial color catalog
```
**What it adds:**
- 70+ nail polish colors from popular brands
- Trending colors (Glazed Donut, Blueberry Milk, etc.)
- Seasonal color collections
- French manicure variations
- Chrome and metallic finishes
- Glitter and matte options
- Initial trending data

### Verification

After running all files, verify your setup:

```sql
-- Check table creation
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check storage buckets
SELECT id, name, public 
FROM storage.buckets;

-- Verify seed data
SELECT category, COUNT(*) as count 
FROM colors 
GROUP BY category 
ORDER BY category;
```

## 🔧 Configuration

### Environment Variables
Make sure your frontend has these Supabase environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Admin Users
To designate admin users (for color management), add a custom claim to the user's JWT:

```json
{
  "role": "admin"
}
```

Or in user metadata:
```json
{
  "user_metadata": {
    "role": "admin"
  }
}
```

## 📊 Key Features Supported

### Anonymous Users
- Can upload hand photos and get AI transformations
- Can view public nail tries and collections
- Data automatically cleaned up after 30 days

### Authenticated Users
- Full profile management with personalization
- Save favorites with personal notes
- Create and manage collections
- Make content public for sharing
- Receive personalized color recommendations
- Access to usage statistics and analytics

### Social Features
- Public nail tries for inspiration
- Shareable collections
- Trending color discovery
- Community-driven content

### Analytics & Recommendations
- User behavior tracking (privacy-respecting)
- Personalized color recommendations based on:
  - Skin tone compatibility
  - Style preferences
  - Usage history
  - Trending data
- App-wide analytics for insights

## 🚀 Performance Optimizations

The database includes several performance optimizations:

### Indexes
- **B-tree indexes** for exact lookups (user_id, color_hex, etc.)
- **GIN indexes** for array and JSON searches (mood_tags, style_preference)
- **Trigram indexes** for text search (color names, collection names)
- **Partial indexes** for filtered queries (public content, preferences)
- **Composite indexes** for common query patterns

### Caching Strategy
- Public transformed images served via CDN
- Color catalog cached for fast browsing
- User preferences cached for recommendations

### Data Cleanup
- Automated cleanup of anonymous uploads (30 days)
- Orphaned record removal
- Storage usage monitoring

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own private data
- Public content is readable by all
- Admin functions properly protected

### Storage Security
- User folder isolation
- File type and size restrictions
- Anonymous upload limitations

### Data Validation
- Hex code format validation
- Email format validation
- Enum constraints for categorical data

## 📱 Frontend Integration

### TypeScript Types
Use the generated types in `/types/supabase.ts` for type-safe database operations:

```typescript
import { Database, NailTry, Color, Collection } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient<Database>()
```

### Common Query Patterns

```typescript
// Get user's nail tries
const { data: nailTries } = await supabase
  .from('nail_tries')
  .select('*, colors(*)')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

// Get trending colors
const { data: trendingColors } = await supabase
  .from('colors')
  .select('*')
  .order('trending_score', { ascending: false })
  .limit(10)

// Create a collection
const { data: collection } = await supabase
  .from('collections')
  .insert({
    user_id: user.id,
    name: 'Spring Vibes',
    description: 'Fresh colors for spring'
  })
  .select()
  .single()
```

### Real-time Subscriptions

```typescript
// Listen for new public nail tries
const subscription = supabase
  .channel('public-nail-tries')
  .on('postgres_changes',
    { 
      event: 'INSERT',
      schema: 'public',
      table: 'nail_tries',
      filter: 'is_public=eq.true'
    },
    (payload) => {
      console.log('New public nail try:', payload.new)
    }
  )
  .subscribe()
```

## 🛠️ Maintenance

### Regular Tasks
1. **Monitor trending scores** - Run weekly trending calculations
2. **Clean up anonymous data** - Automated 30-day cleanup
3. **Review storage usage** - Monitor file storage costs
4. **Analyze user behavior** - Use analytics for improvements

### Backup Strategy
- Supabase handles automated backups
- Consider additional backups for critical color catalog data
- Export user collections for disaster recovery

### Performance Monitoring
Use the included views:
```sql
-- Check index usage
SELECT * FROM index_usage_stats ORDER BY index_reads DESC;

-- Find unused indexes
SELECT * FROM unused_indexes;

-- Monitor storage usage
SELECT * FROM user_storage_usage ORDER BY total_bytes DESC;
```

## 🆘 Troubleshooting

### Common Issues

**1. RLS Policy Errors**
- Ensure user is authenticated when accessing private data
- Check policy conditions match your query filters

**2. Storage Upload Failures**
- Verify file size limits (5-10MB depending on bucket)
- Check file types are in allowed MIME types
- Ensure proper folder structure (user_id/filename)

**3. Foreign Key Violations**
- Verify referenced records exist before creating relationships
- Check cascade delete behavior for cleanup operations

**4. Performance Issues**
- Review query patterns and add indexes as needed
- Consider denormalizing frequently accessed data
- Use appropriate limits on large result sets

### Getting Help
1. Check Supabase documentation
2. Review the generated TypeScript types
3. Use the monitoring views to identify issues
4. Test queries in the SQL Editor before implementing

---

## 📈 Next Steps

After database setup:
1. **Test the complete flow** - Try creating users, nail tries, and collections
2. **Set up authentication** - Configure Supabase Auth in your frontend
3. **Implement storage** - Add image upload functionality
4. **Add analytics** - Start tracking user events for personalization
5. **Monitor performance** - Use the included monitoring tools
6. **Plan scaling** - Consider connection pooling and caching strategies

The database is designed to scale with your app's growth while maintaining performance and security. Good luck with your nail app! 💅✨