export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

const STORAGE_KEY = "manggaReangNotifications";

function isBrowser() {
  return typeof window !== "undefined";
}

function readStoredNotifications(): NotificationItem[] {
  if (!isBrowser()) return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isNotificationItem);
  } catch {
    return [];
  }
}

function isNotificationItem(value: unknown): value is NotificationItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.message === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.read === "boolean"
  );
}

function saveNotifications(notifications: NotificationItem[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event("notifications:changed"));
}

export function getNotifications() {
  return readStoredNotifications();
}

export function addNotification(
  notification: Omit<NotificationItem, "id" | "createdAt" | "read">,
) {
  const notifications = readStoredNotifications();
  const next: NotificationItem = {
    ...notification,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  saveNotifications([next, ...notifications].slice(0, 100));
  return next;
}

export function markAllNotificationsRead() {
  const updated = readStoredNotifications().map((item) => ({
    ...item,
    read: true,
  }));
  saveNotifications(updated);
  return updated;
}
