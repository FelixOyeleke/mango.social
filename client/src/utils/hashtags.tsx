import { Link } from 'react-router-dom';

/**
 * Renders text with clickable hashtags
 * @param text - The text containing hashtags
 * @returns JSX with clickable hashtag links
 */
export function renderTextWithHashtags(text: string) {
  if (!text) return null;

  // Split text by hashtags and mentions while preserving them
  const parts = text.split(/([#@][\w]+)/g);

  return (
    <>
      {parts.map((part, index) => {
        // Hashtag
        if (part.match(/^#[\w]+$/)) {
          const hashtag = part.slice(1).toLowerCase(); // Remove # and lowercase
          return (
            <Link
              key={index}
              to={`/hashtag/${hashtag}`}
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        // Mention
        if (part.match(/^@[\w]+$/)) {
          const username = part.slice(1); // Remove @
          return (
            <Link
              key={index}
              to={`/user/${username}`}
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

/**
 * Extracts hashtags from text
 * @param text - The text to extract hashtags from
 * @returns Array of unique hashtags (without # symbol)
 */
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  
  const hashtagMatches = text.match(/#[\w]+/g);
  if (!hashtagMatches) return [];
  
  // Remove # and convert to lowercase, then get unique values
  return [...new Set(hashtagMatches.map(tag => tag.substring(1).toLowerCase()))];
}

/**
 * Highlights hashtags in text with styling
 * @param text - The text to highlight hashtags in
 * @returns Text with highlighted hashtags
 */
export function highlightHashtags(text: string): string {
  if (!text) return '';
  
  return text.replace(/#([\w]+)/g, '<span class="text-primary-600 dark:text-primary-400 font-medium">#$1</span>');
}
