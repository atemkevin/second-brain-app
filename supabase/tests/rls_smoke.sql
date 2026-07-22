-- Manual RLS smoke checks for the Supabase SQL editor.
-- Replace the UUID values with two real users from Authentication > Users.
-- Run only in a non-production project or inside a transaction that you roll back.

begin;

-- Example identities. Replace before running.
-- select set_config('request.jwt.claim.sub', 'USER_A_UUID', true);
-- set local role authenticated;

-- User A should be able to create and read their own row:
-- insert into public.items (user_id, title) values ('USER_A_UUID', 'RLS own-row test');
-- select * from public.items where user_id = 'USER_A_UUID';

-- User A must not be able to create a row owned by User B:
-- insert into public.items (user_id, title) values ('USER_B_UUID', 'This must fail');

-- User A must not be able to read or update User B rows:
-- select * from public.items where user_id = 'USER_B_UUID';
-- update public.items set title = 'This must not change' where user_id = 'USER_B_UUID';

rollback;

-- Automated application tests should later create two authenticated sessions and
-- verify the same isolation through the Supabase client. This file is intentionally
-- non-destructive and does not contain real user identifiers.
