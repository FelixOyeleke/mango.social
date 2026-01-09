-- Complete cleanup: Remove all seed data
-- Run this with: psql -d immigrant_voices -f cleanup-seed-data.sql

BEGIN;

-- Show before state
SELECT 'BEFORE CLEANUP:' as status;
SELECT 
  (SELECT COUNT(*) FROM likes) as likes,
  (SELECT COUNT(*) FROM bookmarks) as bookmarks,
  (SELECT COUNT(*) FROM reposts) as reposts,
  (SELECT COUNT(*) FROM stories) as stories,
  (SELECT COUNT(*) FROM comments) as comments,
  (SELECT COUNT(*) FROM stories WHERE status = 'draft') as drafts;

-- Delete fake likes
DELETE FROM likes 
WHERE user_id IN (
  SELECT id FROM users WHERE email IN (
    'elena.popov@email.com',
    'ahmed.hassan@email.com',
    'maria.rodriguez@email.com',
    'carlos.santos@email.com',
    'li.wei@email.com',
    'priya.sharma@email.com',
    'sofia.garcia@email.com',
    'james.okonkwo@email.com',
    'yuki.tanaka@email.com',
    'fatima.ali@email.com'
  )
);

-- Delete fake bookmarks
DELETE FROM bookmarks 
WHERE user_id IN (
  SELECT id FROM users WHERE email IN (
    'elena.popov@email.com',
    'ahmed.hassan@email.com',
    'maria.rodriguez@email.com',
    'carlos.santos@email.com',
    'li.wei@email.com',
    'priya.sharma@email.com',
    'sofia.garcia@email.com',
    'james.okonkwo@email.com',
    'yuki.tanaka@email.com',
    'fatima.ali@email.com'
  )
);

-- Delete fake reposts
DELETE FROM reposts 
WHERE user_id IN (
  SELECT id FROM users WHERE email IN (
    'elena.popov@email.com',
    'ahmed.hassan@email.com',
    'maria.rodriguez@email.com',
    'carlos.santos@email.com',
    'li.wei@email.com',
    'priya.sharma@email.com',
    'sofia.garcia@email.com',
    'james.okonkwo@email.com',
    'yuki.tanaka@email.com',
    'fatima.ali@email.com'
  )
);

-- Delete seed comments
DELETE FROM comments 
WHERE user_id IN (
  SELECT id FROM users WHERE email IN (
    'elena.popov@email.com',
    'ahmed.hassan@email.com',
    'maria.rodriguez@email.com',
    'carlos.santos@email.com',
    'li.wei@email.com',
    'priya.sharma@email.com',
    'sofia.garcia@email.com',
    'james.okonkwo@email.com',
    'yuki.tanaka@email.com',
    'fatima.ali@email.com'
  )
);

-- Delete seed stories
DELETE FROM stories 
WHERE author_id IN (
  SELECT id FROM users WHERE email IN (
    'elena.popov@email.com',
    'ahmed.hassan@email.com',
    'maria.rodriguez@email.com',
    'carlos.santos@email.com',
    'li.wei@email.com',
    'priya.sharma@email.com',
    'sofia.garcia@email.com',
    'james.okonkwo@email.com',
    'yuki.tanaka@email.com',
    'fatima.ali@email.com'
  )
);

-- Delete seed users (leave admins intact)
DELETE FROM users
WHERE email IN (
  'elena.popov@email.com',
  'ahmed.hassan@email.com',
  'maria.rodriguez@email.com',
  'carlos.santos@email.com',
  'li.wei@email.com',
  'priya.sharma@email.com',
  'sofia.garcia@email.com',
  'james.okonkwo@email.com',
  'yuki.tanaka@email.com',
  'fatima.ali@email.com'
)
AND role != 'admin';

-- Remove empty conversations left after deleting seed users
DELETE FROM conversations c
WHERE NOT EXISTS (
  SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = c.id
);

-- Show after state
SELECT 'AFTER CLEANUP:' as status;
SELECT 
  (SELECT COUNT(*) FROM likes) as likes,
  (SELECT COUNT(*) FROM bookmarks) as bookmarks,
  (SELECT COUNT(*) FROM reposts) as reposts,
  (SELECT COUNT(*) FROM stories) as stories,
  (SELECT COUNT(*) FROM comments) as comments,
  (SELECT COUNT(*) FROM stories WHERE status = 'draft') as drafts,
  (SELECT COUNT(*) FROM stories WHERE status = 'published') as published;

COMMIT;

SELECT '✅ CLEANUP COMPLETE!' as status;

