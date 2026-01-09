-- Check if location columns exist in users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('city', 'country', 'country_code', 'latitude', 'longitude')
ORDER BY column_name;

-- Check if apps table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'apps'
) as apps_table_exists;

-- Check if user_app_preferences table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'user_app_preferences'
) as user_app_preferences_exists;

