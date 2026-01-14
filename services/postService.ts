
import { Post, User } from '../types';

const STORAGE_KEY = 'lavanflow_posts';

export const getPosts = (): Post[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const createPost = (user: User, content: string): Post => {
  const posts = getPosts();
  const newPost: Post = {
    id: Math.random().toString(36).substr(2, 9),
    authorId: user.id,
    authorName: user.username,
    authorRole: user.role,
    content,
    timestamp: Date.now(),
    likes: 0
  };
  posts.unshift(newPost);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.slice(0, 100)));
  return newPost;
};

export const likePost = (postId: string) => {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === postId);
  if (index >= 0) {
    posts[index].likes += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }
};
