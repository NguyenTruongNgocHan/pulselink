import { NavLink } from "react-router-dom";

import { Avatar } from "../ui/Avatar";
import { Brand } from "../ui/Brand";
import { Icon } from "../ui/Icon";
import type { IconName } from "../ui/Icon";

interface NavigationItem {
  to: string;
  label: string;
  icon: IconName;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  {
    to: "/app/conversations",
    label: "Conversations",
    icon: "chat",
  },
  {
    to: "/app/people",
    label: "People",
    icon: "users",
  },
  {
    to: "/app/search",
    label: "Search",
    icon: "search",
  },
  {
    to: "/app/notifications",
    label: "Notifications",
    icon: "bell",
    badge: 3,
  },
  {
    to: "/app/profile",
    label: "Profile",
    icon: "user",
  },
];

export function AppSidebar() {
  return (
    <aside className="app-sidebar">
      <div>
        <Brand />

        <nav aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "active" : undefined
              }
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.badge ? <em>{item.badge}</em> : null}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-user">
        <span className="connection">
          ● Connected · Realtime
        </span>

        <div>
          <Avatar
            initials="SC"
            tone="green"
            size="sm"
          />
          <span>
            <b>Sarah Chen</b>
            <small>@sarahchen</small>
          </span>
          <Icon name="chevron" size={14} />
        </div>
      </div>
    </aside>
  );
}
