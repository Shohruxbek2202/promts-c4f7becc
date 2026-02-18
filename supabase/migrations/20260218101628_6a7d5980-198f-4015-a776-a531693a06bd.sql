-- Make lesson-videos bucket private (not public)
UPDATE storage.buckets SET public = false WHERE id = 'lesson-videos';
