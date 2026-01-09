-- Clean fake likes, bookmarks, and reposts created by seed users
-- This fixes the "jumping counter" issue (5→51, 3→31)

-- First, let's see what we have
SELECT 'Current counts:' as info;
SELECT 
  (SELECT COUNT(*) FROM likes) as total_likes,
  (SELECT COUNT(*) FROM bookmarks) as total_bookmarks,
  (SELECT COUNT(*) FROM reposts) as total_reposts,
  (SELECT COUNT(*) FROM stories) as total_stories,
  (SELECT COUNT(*) FROM users) as total_users;

-- Show seed users
SELECT 'Seed users:' as info;
SELECT id, email, full_name FROM users 
WHERE email IN (
  'maria.rodriguez@email.com',
  'ahmed.hassan@email.com',
  'li.wei@email.com',
  'priya.sharma@email.com',
  'carlos.santos@email.com',
  'fatima.ali@email.com',
  'yuki.tanaka@email.com',
  'elena.popov@email.com',
  'james.okonkwo@email.com',
  'sofia.garcia@email.com',
  'test@test.com'
);

-- Delete fake likes by seed users
DELETE FROM likes 
WHERE user_id IN (
  SELECT id FROM users 
  WHERE email IN (
    'maria.rodriguez@email.com',
    'ahmed.hassan@email.com',
    'li.wei@email.com',
    'priya.sharma@email.com',
    'carlos.santos@email.com',
    'fatima.ali@email.com',
    'yuki.tanaka@email.com',
    'elena.popov@email.com',
    'james.okonkwo@email.com',
    'sofia.garcia@email.com',
    'test@test.com'
  )
);

-- Delete fake bookmarks by seed users
DELETE FROM bookmarks 
WHERE user_id IN (
  SELECT id FROM users 
  WHERE email IN (
    'maria.rodriguez@email.com',
    'ahmed.hassan@email.com',
    'li.wei@email.com',
    'priya.sharma@email.com',
    'carlos.santos@email.com',
    'fatima.ali@email.com',
    'yuki.tanaka@email.com',
    'elena.popov@email.com',
    'james.okonkwo@email.com',
    'sofia.garcia@email.com',
    'test@test.com'
  )
);

-- Delete fake reposts by seed users
DELETE FROM reposts 
WHERE user_id IN (
  SELECT id FROM users 
  WHERE email IN (
    'maria.rodriguez@email.com',
    'ahmed.hassan@email.com',
    'li.wei@email.com',
    'priya.sharma@email.com',
    'carlos.santos@email.com',
    'fatima.ali@email.com',
    'yuki.tanaka@email.com',
    'elena.popov@email.com',
    'james.okonkwo@email.com',
    'sofia.garcia@email.com',
    'test@test.com'
  )
);

-- Delete seed stories
DELETE FROM stories 
WHERE author_id IN (
  SELECT id FROM users 
  WHERE email IN (
    'maria.rodriguez@email.com',
    'ahmed.hassan@email.com',
    'li.wei@email.com',
    'priya.sharma@email.com',
    'carlos.santos@email.com',
    'fatima.ali@email.com',
    'yuki.tanaka@email.com',
    'elena.popov@email.com',
    'james.okonkwo@email.com',
    'sofia.garcia@email.com',
    'test@test.com'
  )
);

-- Delete seed comments
DELETE FROM comments 
WHERE user_id IN (
  SELECT id FROM users 
  WHERE email IN (
    'maria.rodriguez@email.com',
    'ahmed.hassan@email.com',
    'li.wei@email.com',
    'priya.sharma@email.com',
    'carlos.santos@email.com',
    'fatima.ali@email.com',
    'yuki.tanaka@email.com',
    'elena.popov@email.com',
    'james.okonkwo@email.com',
    'sofia.garcia@email.com',
    'test@test.com'
  )
);

-- Show final counts
SELECT 'After cleanup:' as info;
SELECT 
  (SELECT COUNT(*) FROM likes) as total_likes,
  (SELECT COUNT(*) FROM bookmarks) as total_bookmarks,
  (SELECT COUNT(*) FROM reposts) as total_reposts,
  (SELECT COUNT(*) FROM stories) as total_stories,
  (SELECT COUNT(*) FROM users) as total_users;

