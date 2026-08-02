import { Outlet } from 'react-router-dom'

import { ConversationList } from '@/components/layout/ConversationList'

export function ConversationHubPage() {
  return (
    <main className="workspace triple">
      <ConversationList />
      <Outlet />
    </main>
  )
}
