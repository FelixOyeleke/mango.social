import { query } from '../db/connection.js';

/**
 * Extract hashtags from text
 * Matches #word, #word123, but not #123 (must start with letter)
 */
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  
  const hashtagRegex = /#([a-zA-Z][a-zA-Z0-9_]*)/g;
  const matches = text.match(hashtagRegex);
  
  if (!matches) return [];
  
  // Remove # and convert to lowercase, remove duplicates
  const hashtags = matches.map(tag => tag.slice(1).toLowerCase());
  return [...new Set(hashtags)];
}

/**
 * Process hashtags for a story
 * Creates hashtag records and links them to the story
 */
export async function processHashtags(storyId: string, content: string): Promise<void> {
  const hashtags = extractHashtags(content);
  
  if (hashtags.length === 0) return;
  
  for (const tag of hashtags) {
    try {
      // Insert or get existing hashtag
      const hashtagResult = await query(
        `INSERT INTO hashtags (name) 
         VALUES ($1) 
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [tag]
      );
      
      const hashtagId = hashtagResult.rows[0].id;
      
      // Link hashtag to story (ignore if already exists)
      await query(
        `INSERT INTO story_hashtags (story_id, hashtag_id)
         VALUES ($1, $2)
         ON CONFLICT (story_id, hashtag_id) DO NOTHING`,
        [storyId, hashtagId]
      );
    } catch (error) {
      console.error(`Error processing hashtag ${tag}:`, error);
    }
  }
}

/**
 * Get trending hashtags
 */
export async function getTrendingHashtags(limit: number = 10) {
  const result = await query(
    `SELECT name, usage_count 
     FROM hashtags 
     WHERE usage_count > 0
     ORDER BY usage_count DESC, created_at DESC 
     LIMIT $1`,
    [limit]
  );
  
  return result.rows;
}

/**
 * Search hashtags
 */
export async function searchHashtags(searchTerm: string, limit: number = 10) {
  const result = await query(
    `SELECT name, usage_count 
     FROM hashtags 
     WHERE name ILIKE $1
     ORDER BY usage_count DESC 
     LIMIT $2`,
    [`%${searchTerm}%`, limit]
  );
  
  return result.rows;
}

