import { useContext } from "react";
import { NotificationContext } from "@/providers/notification-provider";

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }

  const { showNotification } = context;

  const showInfo = (message: string, duration?: number) => {
    showNotification({ message, type: "info", duration });
  };

  const showError = (message: string, duration?: number) => {
    showNotification({ message, type: "error", duration });
  };

  const notifyUser = (error: unknown) => {
    if (error instanceof Error) {
      if (error.toString().includes("ProviderNotFoundError")) {
        return showError(`No wallet detected. NGMI`);
      } else if (error.toString().includes("Failed to connect to RPC")) {
        return showError(`Failed to connect to RPC network`);
      } else if (error.toString().includes("User rejected the request")) {
        return showInfo(`User rejected the request`);
      } else if (error.toString().includes("Request blocked due to spam filter")) {
        return showError(`Request blocked due to spam filter`);
      } 
    }

    console.error(`Unknown error: ${error}`);
    return showError(`Unknown error: ${error}`);
  };

  return {
    showNotification,
    showInfo,
    showError,
    notifyUser
  };
}; 