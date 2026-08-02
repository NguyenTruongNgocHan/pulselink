import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { MemberPicker } from '@/features/groups/components/MemberPicker'
import { useCreateGroup } from '@/features/groups/hooks/useCreateGroup'
import { usePeopleSearch } from '@/features/people/hooks/usePeopleSearch'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { getInitials } from '@/shared/utils/avatar'

export function CreateGroupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const createGroupMutation = useCreateGroup()
  const { peopleQuery } = usePeopleSearch(query)

  const friends = useMemo(
    () =>
      (peopleQuery.data ?? []).filter(
        (person) => person.relationshipStatus === 'FRIEND',
      ),
    [peopleQuery.data],
  )

  const selectedPeople = useMemo(
    () => friends.filter((person) => selectedIds.includes(person.id)),
    [friends, selectedIds],
  )

  const canCreate = name.trim().length >= 2 && selectedIds.length >= 2

  const toggleMember = (personId: string) => {
    setSelectedIds((current) =>
      current.includes(personId)
        ? current.filter((id) => id !== personId)
        : [...current, personId],
    )
  }

  const handleCreate = async () => {
    if (!canCreate) return

    const group = await createGroupMutation.mutateAsync({
      name: name.trim(),
      memberIds: selectedIds,
    })

    navigate(routes.conversation(group.id))
  }

  return (
    <main className="group-create-page">
      <section className="group-create-summary">
        <button
          type="button"
          className="group-back-button"
          onClick={() => navigate(routes.conversations)}
        >
          <Icon name="arrowLeft" size={17} />
          Back to messages
        </button>

        <header className="group-create-summary__header">
          <span className="eyebrow">New group</span>
          <h1>Create a private space</h1>
          <p>
            Choose a name and invite at least two friends to start the
            conversation.
          </p>
        </header>

        <section className="group-preview-card" aria-label="Group preview">
          <div className="group-preview-card__identity">
            <Avatar
              initials={getInitials(name || 'PulseLink group')}
              tone="violet"
              size="xl"
            />
            <div>
              <small>Group preview</small>
              <h2>{name.trim() || 'Untitled group'}</h2>
              <p>
                {selectedIds.length}{' '}
                {selectedIds.length === 1 ? 'member selected' : 'members selected'}
              </p>
            </div>
          </div>

          <div className="group-preview-card__privacy">
            <Icon name="lock" size={17} />
            Private conversation
          </div>
        </section>

        <label className="group-name-field">
          <span>
            <b>Group name</b>
            <small>{name.length}/60</small>
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            placeholder="Weekend plans"
            autoFocus
          />
        </label>

        <section className="group-selected-section">
          <header>
            <div>
              <h2>Selected members</h2>
              <p>These friends will join when the group is created.</p>
            </div>
            <span>{selectedIds.length}/2 minimum</span>
          </header>

          <div className="group-selected-list">
            {selectedPeople.map((person) => (
              <article className="group-selected-person" key={person.id}>
                <Avatar
                  initials={getInitials(person.displayName)}
                  tone="violet"
                  online={person.isOnline}
                  size="sm"
                />
                <span>
                  <b>{person.displayName}</b>
                  <small>@{person.username}</small>
                </span>
                <button
                  type="button"
                  onClick={() => toggleMember(person.id)}
                  aria-label={`Remove ${person.displayName}`}
                >
                  <Icon name="x" size={15} />
                </button>
              </article>
            ))}

            {selectedPeople.length === 0 ? (
              <div className="group-selected-empty">
                <Icon name="users" size={21} />
                <span>
                  <b>No one selected yet</b>
                  <small>Choose at least two friends from the list.</small>
                </span>
              </div>
            ) : null}
          </div>
        </section>

        {createGroupMutation.error ? (
          <InlineAlert
            tone="danger"
            onDismiss={() => createGroupMutation.reset()}
          >
            {getApiErrorMessage(createGroupMutation.error)}
          </InlineAlert>
        ) : null}

        <footer className="group-create-footer">
          <span className={canCreate ? 'ready' : undefined}>
            <i />
            {canCreate
              ? 'Ready to create'
              : 'Add a name and select two friends'}
          </span>

          <Button
            disabled={!canCreate || createGroupMutation.isPending}
            onClick={() => void handleCreate()}
          >
            {createGroupMutation.isPending ? 'Creating…' : 'Create group'}
          </Button>
        </footer>
      </section>

      <MemberPicker
        people={friends}
        selectedIds={selectedIds}
        query={query}
        isLoading={peopleQuery.isLoading}
        onQueryChange={setQuery}
        onToggle={toggleMember}
      />
    </main>
  )
}