'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import FormField from '@/components/FormField';
import ImageUpload from './ImageUpload';
import { createPost } from '@/lib/actions/community.action';

const PostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(500, 'Content must be less than 500 characters'),
});

type PostFormData = z.infer<typeof PostSchema>;

export default function PostForm() {
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
        // Trigger a page refresh to show the new post
        window.location.reload();
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Share with the Community
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="content"
            control={form.control}
            label="What's on your mind?"
            placeholder="Share your latest project, tips, or thoughts..."
            // rows={4}
          />
          
          <ImageUpload
            onImageUpload={setUploadedImage}
            uploadedImage={uploadedImage}
          />
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full cursor-pointer"
            >
              {loading ? 'Posting...' : 'Share Post'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}