export type NotificationType = "error" | "info";

export interface NotificationMessage {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface Notification {
  message: string;
  type?: NotificationType;
  duration?: number;
};
