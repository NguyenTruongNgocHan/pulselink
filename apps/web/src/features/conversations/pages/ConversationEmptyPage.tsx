import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { routes } from '@/shared/constants/routes'

export function ConversationEmptyPage() {
  const navigate = useNavigate()

  return (
    <section className="empty-canvas conversation-empty">
      <div className="empty-icon">
        <Icon name="chat" size={34} />
      </div>
      <span className="eyebrow">Private by design</span>
      <h2>Choose a conversation</h2>
      <p>Select a conversation from the list or start a new one with someone you trust.</p>
      <div className="conversation-empty__actions">
        <Button onClick={() => navigate(routes.people)}>
          <Icon name="plus" />
          New conversation
        </Button>
        <Button variant="secondary" onClick={() => navigate(routes.createGroup)}>
          <Icon name="group" />
          Create group
        </Button>
      </div>
      <small>Your messages stay between you and the people you choose.</small>
    </section>
  )
}
