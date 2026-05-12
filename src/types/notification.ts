export interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string; // ISO string
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface ReadAllResponse {
  updated: number;
}
