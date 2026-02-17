
-- 1. Allow the handle_new_user trigger to work + allow users to insert their own profile (fallback)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Allow authenticated users to insert into user_courses (for admin-approved payments)
CREATE POLICY "Users can insert own course enrollment"
ON public.user_courses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Allow admins to insert user_courses on behalf of users
CREATE POLICY "Admins can insert user courses"
ON public.user_courses FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- 4. Allow anyone (including anon) to update view_count and copy_count on prompts
CREATE POLICY "Anyone can increment prompt counters"
ON public.prompts FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
