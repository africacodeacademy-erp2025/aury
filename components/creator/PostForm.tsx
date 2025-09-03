'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import ImageUpload from './ImageUpload';
import { createPost } from '@/lib/actions/community.action';

const PostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(500, 'Content must be less than 500 characters'),
});

type PostFormData = z.infer<typeof PostSchema>;

interface PostFormProps {
  onSuccess?: () => void;
}

export default function PostForm({ onSuccess }: PostFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const form = useForm<PostFormData>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (data: PostFormData) => {
    setLoading(true);
    
    try {
      const result = await createPost({
        content: data.content,
        imageUrl: uploadedImage,
      });

      if (result.success) {
        toast.success('Post created successfully!');
        form.reset();
        setUploadedImage(null);
        onSuccess?.();
        // Trigger a page refresh to show the new post
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(result.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What&apos;s on your mind?
            </label>
            <textarea
              {...form.register('content')}
              placeholder="Share your latest project, tips, or thoughts..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
            {form.formState.errors.content && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>
          
          <ImageUpload
            onImageUpload={setUploadedImage}
            uploadedImage={uploadedImage}
          />
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg 
                       font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Share Post'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}