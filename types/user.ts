export interface UserDTO {
  userId: string;
  /** Unique handle for @mentions, profile routes, and URLs (e.g., "johndoe") */
  username: string;
  /** Real / display name shown prominently on videos, channel, comments (e.g., "John Doe") */
  fullName: string;
  user_email?: string;
  avatar_url?: string;
  user_role?: string;
  /** Backward-compatible aliases */
  user_name?: string;
  full_name?: string;
}

export interface UsernameCheckResult {
  available: boolean;
  valid: boolean;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  username: string;
  fullName?: string;
  avatar_url?: string;
  /** Backward compatibility */
  user_name?: string;
}

export interface UpdateUserProfilePayload {
  userId: string;
  fullName?: string;
  username?: string;
  avatar_url?: string;
  user_email?: string;
  /** Backward compatibility */
  user_name?: string;
}

export interface WatchProgressDTO {
  videoId: number;
  videoTitle: string;
  slug: string;
  thumbnailUrl?: string;
  /** Channel display name (Full Name) */
  channelName?: string;
  /** Channel unique handle (@username) */
  channelHandle?: string;
  channelAvatar?: string;
  progressSeconds: number;
  durationSeconds?: number;
  completed: boolean;
  lastWatchedAt: string;
}
