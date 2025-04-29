"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Notification } from "./notification";
import { NotificationMessage } from "./notification-types";

interface NotificationContainerProps {
  notifications: NotificationMessage[];
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const portalRoot = document.getElementById("notification-root");
  if (!portalRoot) return null;

  return createPortal(
    <div className="fixed top-8 left-8 right-8 z-1 flex flex-col gap-5 pointer-events-none">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
        />
      ))}
    </div>,
    portalRoot
  );
};
