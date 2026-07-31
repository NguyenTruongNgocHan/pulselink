export type PresenceStatus = "online" | "offline";

export interface Person {
  id: string;
  displayName: string;
  username: string;
  initials: string;
  avatarTone: string;
  presence: PresenceStatus;
}

export interface ConversationSummary {
  id: string;
  title: string;
  initials: string;
  preview: string;
  timestamp: string;
  unreadCount: number;
  avatarTone: string;
  kind: "direct" | "group";
}
