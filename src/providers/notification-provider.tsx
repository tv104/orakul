"use client";

import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  PropsWithChildren,
  useContext,
} from "react";
import { NotificationContainer } from "../components/notification/notification-container";
import type {
  NotificationMessage,
  Notification,
} from "../components/notification/notification-types";

interface NotificationContextType {
  showNotification: (notification: Notification) => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export const NotificationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<
    NotificationMessage[]
  >([]);
  const [hiddenNotifications, setHiddenNotifications] = useState<string[]>([]);

  // Only clear DOM notifications when all are hidden
  useEffect(() => {
    if (
      hiddenNotifications.length > 0 &&
      hiddenNotifications.length === visibleNotifications.length
    ) {
      setHiddenNotifications([]);
      setVisibleNotifications([]);
    }
  }, [hiddenNotifications, visibleNotifications]);

  const clearNotification = useCallback((id: string, timeout: number) => {
    const addToHidden = () => setHiddenNotifications((prev) => [...prev, id]);
    setTimeout(addToHidden, timeout);
  }, []);

  const showNotification = useCallback(
    ({ message, type = "info", duration = 3000 }: Notification) => {
      const id = Math.random().toString(36).substring(2, 9);
      setVisibleNotifications((prev) => [
        ...prev,
        { id, message, type, duration },
      ]);
      clearNotification(id, duration);
    },
    [clearNotification]
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer notifications={visibleNotifications} />
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }

  const { showNotification } = context;

  return {
    showNotification,
  };
};

export default NotificationProvider;
