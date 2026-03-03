import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface UserProfile {
  principalId: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  createdAt: number;
  isSuspended: boolean;
}

export interface Post {
  postId: string;
  authorPrincipalId: string;
  text: string;
  imageUrl: string;
  createdAt: number;
  isDeleted: boolean;
}

export interface Comment {
  commentId: string;
  postId: string;
  authorPrincipalId: string;
  text: string;
  createdAt: number;
}

export interface AppState {
  profiles: Map<string, UserProfile>;
  posts: Post[];
  follows: Set<string>; // "follower#followee"
  likes: Set<string>; // "principalId#postId"
  comments: Comment[];
}

// Demo seed data
const DEMO_USERS: UserProfile[] = [
  {
    principalId: "demo-alex-rivera",
    displayName: "Alex Rivera",
    bio: "Photographer & visual storyteller 📸 | Capturing moments that matter | Based in SF",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    isSuspended: false,
  },
  {
    principalId: "demo-jordan-kim",
    displayName: "Jordan Kim",
    bio: "Full-stack dev & coffee enthusiast ☕ | Building the future one commit at a time | They/them",
    avatarUrl: "https://i.pravatar.cc/150?img=22",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    isSuspended: false,
  },
  {
    principalId: "demo-sam-okafor",
    displayName: "Sam Okafor",
    bio: "Chef & food writer 🍳 | Author of 'Modern African Kitchen' | Sharing recipes that tell stories",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    isSuspended: false,
  },
];

const DEMO_POSTS: Post[] = [
  {
    postId: "post-001",
    authorPrincipalId: "demo-alex-rivera",
    text: "Golden hour at Baker Beach yesterday — the light was absolutely perfect. Sometimes you just have to drop everything and chase the sunset. 🌅 #photography #sanfrancisco #goldengate",
    imageUrl:
      "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=600&q=80",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    isDeleted: false,
  },
  {
    postId: "post-002",
    authorPrincipalId: "demo-jordan-kim",
    text: "Just shipped a new feature that I've been working on for 3 weeks — real-time collaborative editing with conflict-free merging. The algorithm is beautiful. Sometimes the hardest problems have the most elegant solutions 🧠 #webdev #typescript #shipping",
    imageUrl: "",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    isDeleted: false,
  },
  {
    postId: "post-003",
    authorPrincipalId: "demo-sam-okafor",
    text: "Today's kitchen experiment: Jollof rice meets risotto technique. Used arborio rice, smoked tomato base, and finished with a drizzle of palm oil infused with scotch bonnet. The result? Pure magic. Recipe dropping on the blog this Friday! 🍚✨",
    imageUrl:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&q=80",
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    isDeleted: false,
  },
  {
    postId: "post-004",
    authorPrincipalId: "demo-alex-rivera",
    text: "Street portraits series, Day 14. Met Marcus at the farmer's market — he's been selling handmade pottery for 40 years. Every piece tells a story. People are endlessly fascinating. 🏺",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    isDeleted: false,
  },
  {
    postId: "post-005",
    authorPrincipalId: "demo-jordan-kim",
    text: "Hot take: The best code is the code you delete. Spent today removing 400 lines of over-engineered abstraction and replacing it with 40 lines that actually make sense. Simplicity is the ultimate sophistication. 🎯",
    imageUrl: "",
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    isDeleted: false,
  },
];

const DEMO_FOLLOWS: string[] = [
  "demo-alex-rivera#demo-jordan-kim",
  "demo-alex-rivera#demo-sam-okafor",
  "demo-jordan-kim#demo-sam-okafor",
  "demo-sam-okafor#demo-alex-rivera",
];

const DEMO_LIKES: string[] = [
  "demo-alex-rivera#post-002",
  "demo-alex-rivera#post-003",
  "demo-jordan-kim#post-001",
  "demo-jordan-kim#post-003",
  "demo-sam-okafor#post-001",
  "demo-sam-okafor#post-004",
];

const DEMO_COMMENTS: Comment[] = [
  {
    commentId: "comment-001",
    postId: "post-001",
    authorPrincipalId: "demo-jordan-kim",
    text: "Incredible shot! The way the bridge disappears into the fog is chef's kiss 🌉",
    createdAt: Date.now() - 1000 * 60 * 90,
  },
  {
    commentId: "comment-002",
    postId: "post-001",
    authorPrincipalId: "demo-sam-okafor",
    text: "I need to visit SF one day. This view is breathtaking.",
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    commentId: "comment-003",
    postId: "post-003",
    authorPrincipalId: "demo-alex-rivera",
    text: "This fusion concept is brilliant! Cannot wait for the recipe. Will definitely try this weekend 🔥",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    commentId: "comment-004",
    postId: "post-002",
    authorPrincipalId: "demo-sam-okafor",
    text: "Congrats on shipping! The dedication shows. What stack are you using?",
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
];

function createInitialState(): AppState {
  const profiles = new Map<string, UserProfile>();
  for (const user of DEMO_USERS) {
    profiles.set(user.principalId, user);
  }
  return {
    profiles,
    posts: [...DEMO_POSTS],
    follows: new Set(DEMO_FOLLOWS),
    likes: new Set(DEMO_LIKES),
    comments: [...DEMO_COMMENTS],
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface SocialContextValue {
  // State
  profiles: Map<string, UserProfile>;
  posts: Post[];
  follows: Set<string>;
  likes: Set<string>;
  comments: Comment[];

  // Profile actions
  upsertProfile: (profile: UserProfile) => void;
  getProfile: (principalId: string) => UserProfile | undefined;

  // Post actions
  createPost: (
    authorPrincipalId: string,
    text: string,
    imageUrl: string,
  ) => Post;
  deletePost: (postId: string) => void;
  restorePost: (postId: string) => void;

  // Follow actions
  followUser: (
    followerPrincipalId: string,
    followeePrincipalId: string,
  ) => void;
  unfollowUser: (
    followerPrincipalId: string,
    followeePrincipalId: string,
  ) => void;
  isFollowing: (
    followerPrincipalId: string,
    followeePrincipalId: string,
  ) => boolean;
  getFollowers: (principalId: string) => string[];
  getFollowing: (principalId: string) => string[];

  // Like actions
  toggleLike: (principalId: string, postId: string) => void;
  hasLiked: (principalId: string, postId: string) => boolean;
  getLikeCount: (postId: string) => number;

  // Comment actions
  addComment: (
    postId: string,
    authorPrincipalId: string,
    text: string,
  ) => Comment;
  getComments: (postId: string) => Comment[];

  // Feed
  getFeed: (principalId: string) => Post[];
  getAllPosts: () => Post[];

  // Admin actions
  suspendUser: (principalId: string) => void;
  unsuspendUser: (principalId: string) => void;

  // Force re-render trigger
  version: number;
}

const SocialContext = createContext<SocialContextValue | undefined>(undefined);

export function useSocial(): SocialContextValue {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}

export function SocialProvider({
  children,
}: PropsWithChildren<{ children: ReactNode }>) {
  const stateRef = useRef<AppState>(createInitialState());
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const upsertProfile = useCallback(
    (profile: UserProfile) => {
      stateRef.current.profiles.set(profile.principalId, profile);
      bump();
    },
    [bump],
  );

  const getProfile = useCallback((principalId: string) => {
    return stateRef.current.profiles.get(principalId);
  }, []);

  const createPost = useCallback(
    (authorPrincipalId: string, text: string, imageUrl: string): Post => {
      const post: Post = {
        postId: generateId(),
        authorPrincipalId,
        text,
        imageUrl,
        createdAt: Date.now(),
        isDeleted: false,
      };
      stateRef.current.posts.unshift(post);
      bump();
      return post;
    },
    [bump],
  );

  const deletePost = useCallback(
    (postId: string) => {
      const post = stateRef.current.posts.find((p) => p.postId === postId);
      if (post) {
        post.isDeleted = true;
        bump();
      }
    },
    [bump],
  );

  const restorePost = useCallback(
    (postId: string) => {
      const post = stateRef.current.posts.find((p) => p.postId === postId);
      if (post) {
        post.isDeleted = false;
        bump();
      }
    },
    [bump],
  );

  const followUser = useCallback(
    (followerPrincipalId: string, followeePrincipalId: string) => {
      stateRef.current.follows.add(
        `${followerPrincipalId}#${followeePrincipalId}`,
      );
      bump();
    },
    [bump],
  );

  const unfollowUser = useCallback(
    (followerPrincipalId: string, followeePrincipalId: string) => {
      stateRef.current.follows.delete(
        `${followerPrincipalId}#${followeePrincipalId}`,
      );
      bump();
    },
    [bump],
  );

  const isFollowing = useCallback(
    (followerPrincipalId: string, followeePrincipalId: string) => {
      return stateRef.current.follows.has(
        `${followerPrincipalId}#${followeePrincipalId}`,
      );
    },
    [],
  );

  const getFollowers = useCallback((principalId: string) => {
    const result: string[] = [];
    for (const entry of stateRef.current.follows) {
      const [follower, followee] = entry.split("#");
      if (followee === principalId) result.push(follower);
    }
    return result;
  }, []);

  const getFollowing = useCallback((principalId: string) => {
    const result: string[] = [];
    for (const entry of stateRef.current.follows) {
      const [follower, followee] = entry.split("#");
      if (follower === principalId) result.push(followee);
    }
    return result;
  }, []);

  const toggleLike = useCallback(
    (principalId: string, postId: string) => {
      const key = `${principalId}#${postId}`;
      if (stateRef.current.likes.has(key)) {
        stateRef.current.likes.delete(key);
      } else {
        stateRef.current.likes.add(key);
      }
      bump();
    },
    [bump],
  );

  const hasLiked = useCallback((principalId: string, postId: string) => {
    return stateRef.current.likes.has(`${principalId}#${postId}`);
  }, []);

  const getLikeCount = useCallback((postId: string) => {
    let count = 0;
    for (const key of stateRef.current.likes) {
      if (key.endsWith(`#${postId}`)) count++;
    }
    return count;
  }, []);

  const addComment = useCallback(
    (postId: string, authorPrincipalId: string, text: string): Comment => {
      const comment: Comment = {
        commentId: generateId(),
        postId,
        authorPrincipalId,
        text,
        createdAt: Date.now(),
      };
      stateRef.current.comments.push(comment);
      bump();
      return comment;
    },
    [bump],
  );

  const getComments = useCallback((postId: string) => {
    return stateRef.current.comments.filter((c) => c.postId === postId);
  }, []);

  const getFeed = useCallback((principalId: string) => {
    const following = new Set<string>();
    for (const entry of stateRef.current.follows) {
      const [follower, followee] = entry.split("#");
      if (follower === principalId) following.add(followee);
    }
    following.add(principalId);
    return stateRef.current.posts
      .filter((p) => !p.isDeleted && following.has(p.authorPrincipalId))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, []);

  const getAllPosts = useCallback(() => {
    return [...stateRef.current.posts].sort(
      (a, b) => b.createdAt - a.createdAt,
    );
  }, []);

  const suspendUser = useCallback(
    (principalId: string) => {
      const profile = stateRef.current.profiles.get(principalId);
      if (profile) {
        stateRef.current.profiles.set(principalId, {
          ...profile,
          isSuspended: true,
        });
        bump();
      }
    },
    [bump],
  );

  const unsuspendUser = useCallback(
    (principalId: string) => {
      const profile = stateRef.current.profiles.get(principalId);
      if (profile) {
        stateRef.current.profiles.set(principalId, {
          ...profile,
          isSuspended: false,
        });
        bump();
      }
    },
    [bump],
  );

  const value: SocialContextValue = {
    profiles: stateRef.current.profiles,
    posts: stateRef.current.posts,
    follows: stateRef.current.follows,
    likes: stateRef.current.likes,
    comments: stateRef.current.comments,
    upsertProfile,
    getProfile,
    createPost,
    deletePost,
    restorePost,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowers,
    getFollowing,
    toggleLike,
    hasLiked,
    getLikeCount,
    addComment,
    getComments,
    getFeed,
    getAllPosts,
    suspendUser,
    unsuspendUser,
    version,
  };

  return createElement(SocialContext.Provider, { value }, children);
}
