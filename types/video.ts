export type VideoCategory =
  | 'TECH'
  | 'EDUCATION'
  | 'GAMING'
  | 'ENTERTAINMENT'
  | 'MUSIC'
  | 'NEWS'
  | 'SPORTS'
  | 'LIFESTYLE'
  | 'OTHER';

export type VideoVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';

export type VideoStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface SeoMetadataDTO {
  title: string;
  description: string;
  canonicalUrl: string;
  jsonLdVideoObject: Record<string, unknown>;
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
}

export interface UserDTO {
  userId: string;
  user_name: string;
  user_email?: string;
  user_role?: string;
  avatar_url?: string;
}

export interface VideoDTO {
  videoId: number;
  video_title: string;
  slug?: string;
  description?: string;
  tags?: string[];
  category?: VideoCategory;
  visibility?: VideoVisibility;
  video_uploadDate: string;
  video_views: number;
  m3u8Url?: string;
  video_duration?: string;
  iso_duration?: string;
  thumbnail_url?: string;
  videoStatus?: VideoStatus;
  video_uploader?: UserDTO;
  seo?: SeoMetadataDTO;
}

export interface VideoMetadataUpdateRequest {
  videoTitle?: string;
  description?: string;
  tags?: string[];
  category?: VideoCategory;
  visibility?: VideoVisibility;
}

export interface PaginatedVideoResponse {
  content: VideoDTO[];
  number: number;
  totalPages: number;
  totalElements?: number;
  last: boolean;
}
