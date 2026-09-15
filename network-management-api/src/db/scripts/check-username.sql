-- Manual checks for available_usernames (run in Coolify → wewifi-postgres → Terminal)
-- Replace YOUR_USERNAME with the value from Excel, e.g. 639772752140PP

-- 1) One username: does it exist? assigned? expired? which speed?
SELECT
  au.id,
  au.username,
  au.speed_id,
  st.speed_value AS speed_mbps,
  au.is_used,
  au.is_expired,
  au.is_owner_username,
  au.created_at,
  s.line_id,
  s.full_name AS subscriber_name
FROM available_usernames au
LEFT JOIN speed_tiers st ON st.id = au.speed_id
LEFT JOIN subscribers s ON s.username_id = au.id
WHERE au.username = 'YOUR_USERNAME';

-- 2) Search partial username
SELECT au.username, au.speed_id, au.is_used, au.is_expired, au.created_at
FROM available_usernames au
WHERE au.username ILIKE '%PART_OF_NAME%'
ORDER BY au.username;

-- 3) All usernames for one speed tier (change speed_id)
SELECT au.username, au.is_used, au.is_expired, au.created_at
FROM available_usernames au
WHERE au.speed_id = 1
ORDER BY au.created_at DESC;

-- 4) Hidden from pool list: expired usernames
SELECT au.username, au.speed_id, au.is_expired, au.created_at
FROM available_usernames au
WHERE au.is_expired = true
ORDER BY au.created_at DESC
LIMIT 100;

-- 5) Hidden from pool list: assigned to subscribers
SELECT au.username, au.speed_id, s.line_id, s.full_name
FROM available_usernames au
JOIN subscribers s ON s.username_id = au.id
WHERE au.is_used = true
ORDER BY au.username;
