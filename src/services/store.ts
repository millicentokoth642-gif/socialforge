import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  increment,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { OperationType, handleFirestoreError } from '../lib/error-handler';

export interface Post {
  id?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  createdAt: any;
  updatedAt?: any;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  retweetsCount: number;
  reactions: Record<string, number>;
  platform: 'x' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'snapchat' | 'telegram';
  isVerified: boolean;
}

export interface Profile {
  userId: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
  professionalType: string;
  platform?: string;
  stats: Record<string, number>;
}

// Post Services
export const postService = {
  async createPost(content: string, platform: Post['platform'] = 'x', imageUrl?: string, customAuthor?: { name: string, avatar: string }) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const path = 'posts';
    try {
      const postData: any = {
        authorId: user.uid,
        authorName: customAuthor?.name || user.displayName || 'Anonymous',
        authorAvatar: customAuthor?.avatar || user.photoURL || '',
        content,
        platform,
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        retweetsCount: 0,
        reactions: {
          like: 0,
          love: 0,
          care: 0,
          haha: 0,
          wow: 0,
          sad: 0,
          angry: 0
        },
        isVerified: false
      };
      
      // Only include imageUrl if it exists to keep keys predictable for rules
      if (imageUrl) {
        postData.imageUrl = imageUrl;
      } else {
        postData.imageUrl = null; // Still include it as null to match my rules if needed
      }

      return await addDoc(collection(db, path), postData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updatePost(postId: string, updates: Partial<Post>) {
    const path = `posts/${postId}`;
    try {
      await updateDoc(doc(db, 'posts', postId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async likePost(postId: string) {
    const path = `posts/${postId}`;
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likesCount: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deletePost(postId: string) {
    const path = `posts/${postId}`;
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeToPosts(callback: (posts: Post[]) => void) {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      callback(posts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });
  }
};

// Profile Services
export const profileService = {
  async updateProfile(profile: Partial<Profile>) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const path = `profiles/${user.uid}`;
    try {
      await setDoc(doc(db, 'profiles', user.uid), {
        ...profile,
        userId: user.uid
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeToProfile(userId: string, callback: (profile: Profile | null) => void) {
    return onSnapshot(doc(db, 'profiles', userId), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as Profile);
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `profiles/${userId}`);
    });
  }
};
