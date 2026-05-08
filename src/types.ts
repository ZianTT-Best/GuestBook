export interface Comment {
  id: string;
  nickname: string;
  email?: string;
  website?: string;
  content: string;
  ip?: string;
  country?: string;
  createdAt: number;
  likes: number;
  isPinned: boolean;
  isDeleted: boolean;
}

export interface CommentInput {
  nickname: string;
  email?: string;
  website?: string;
  content: string;
  powNonce: string;
  powSuffix: string;
}

export interface Challenge {
  nonce: string;
  difficulty: number;
}

export interface PageInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CommentsResponse {
  comments: Comment[];
  pageInfo: PageInfo;
  announcement: string;
}
