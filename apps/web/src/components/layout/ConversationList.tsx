import { NavLink } from "react-router-dom";

import { conversations } from "../../data/conversations";
import { Avatar } from "../ui/Avatar";
import { Icon } from "../ui/Icon";

function getConversationPath(
  conversationId: string,
  kind: "direct" | "group",
) {
  if (kind === "group") {
    return `/app/groups/${conversationId}`;
  }

  return `/app/conversations/${conversationId}`;
}

export function ConversationList() {
  return (
    <aside className="list-panel">
      <header>
        <div>
          <h1>Messages</h1>
          <small>3 unread</small>
        </div>

        <button
          className="square primary"
          type="button"
          aria-label="Create conversation"
        >
          <Icon name="edit" />
        </button>
      </header>

      <label className="searchbox">
        <Icon name="search" />
        <input placeholder="Search conversations" />
      </label>

      <div className="tabs">
        <button className="active" type="button">
          All
        </button>
        <button type="button">Unread</button>
        <button type="button">Groups</button>
      </div>

      <div className="conversation-list">
        {conversations.map((conversation) => (
          <NavLink
            key={conversation.id}
            to={getConversationPath(
              conversation.id,
              conversation.kind,
            )}
            className={({ isActive }) =>
              isActive ? "active" : undefined
            }
          >
            <Avatar
              initials={conversation.initials}
              tone={conversation.avatarTone}
              online={conversation.timestamp !== "1h"}
            />

            <span>
              <b>{conversation.title}</b>
              <small>{conversation.preview}</small>
            </span>

            <time>
              {conversation.timestamp}
              {conversation.unreadCount > 0 ? (
                <em>{conversation.unreadCount}</em>
              ) : null}
            </time>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
