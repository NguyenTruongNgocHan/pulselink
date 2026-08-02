import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { routes } from '@/shared/constants/routes'

export function ConversationEmptyPage() {
  const navigate = useNavigate()

  return (
    <section className="empty-canvas conversation-empty">
      <div className="conversation-empty__visual" aria-hidden="true">
        <span className="empty-icon">
          <Icon name="chat" size={32} />
        </span>
      </div>

      <span className="eyebrow">PulseLink messages</span>
      <h2>Your conversations, in one place.</h2>
      <p>Pick up where you left off, or start something new.</p>

      <div className="conversation-empty__actions">
        <Button onClick={() => navigate(routes.people)}>
          <Icon name="plus" />
          New message
        </Button>
        <Button variant="secondary" onClick={() => navigate(routes.createGroup)}>
          <Icon name="group" />
          New group
        </Button>
      </div>
    </section>
  )
}