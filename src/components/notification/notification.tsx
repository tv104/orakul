import { type NotificationType } from "./notification-types";
export const Notification = ({
  message,
  type,
}: {
  message: string;
  type: NotificationType;
}) => {
  return (
    <div
      className={`flex items-center px-6 py-3 rounded shadow-md max-w-xs mx-auto enter-and-exit-notification
          ${type === "error" ? "bg-rose-700/90" : "bg-blue-600/90"}`}
    >
      <span className="text-sm text-white">{message}</span>
    </div>
  );
};
