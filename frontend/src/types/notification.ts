export interface NotificationData {
  newsId?: {
    _id: string;
    title: { en: string; kh: string };
    slug: string;
    thumbnail?: string;
  };
  categoryId?: {
    _id: string;
    name: { en: string; kh: string };
    color?: string;
  };
  actionUrl?: string;
  imageUrl?: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: 'news_published' | 'news_updated' | 'breaking_news' | 'system';
  title: {
    en: string;
    kh: string;
  };
  message: {
    en: string;
    kh: string;
  };
  data: NotificationData;
  isRead: boolean;
  isImportant: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  formattedDate?: string;
  timeAgo?: string;
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  totalPages: number;
  currentPage: number;
  totalNotifications: number;
  unreadCount: number;
}

export interface NotificationCountResponse {
  success: boolean;
  unreadCount: number;
}

export interface NotificationActionResponse {
  success: boolean;
  message?: string;
  notification?: Notification;
} 