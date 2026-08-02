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
    <main className="create-group">
      <section className="create-summary">
        <button
          type="button"
          className="back-link"
          onClick={() => navigate(routes.conversations)}
        >
          <Icon name="arrowLeft" size={17} />
          Messages
        </button>

        <div className="create-summary__title">
          <span className="eyebrow">New private space</span>
          <h1>Create group</h1>
          <p>Start a private conversation with two or more friends.</p>
        </div>

        <div className="photo-row">
          <Avatar initials={getInitials(name)} tone="violet" size="xl" />
          <span>
            <b>Group photo</b>
            <small>You can upload a custom photo after creating the group.</small>
          </span>
        </div>

        <label className="form-field">
          <span>Group name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            placeholder="Weekend plans"
            autoFocus
          />
          <small>{name.length}/60</small>
        </label>

        <div className="selected-head">
          <b>Selected members</b>
          <span>{selectedIds.length} selected</span>
        </div>

        <div className="selected-members">
          {selectedPeople.map((person) => (
            <div className="selected-member" key={person.id}>
              <Avatar initials={getInitials(person.displayName)} tone="violet" />
              <span>
                <b>{person.displayName}</b>
                <small>@{person.username}</small>
              </span>
              <button
                type="button"
                onClick={() => toggleMember(person.id)}
                aria-label={`Remove ${person.displayName}`}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          ))}

          {selectedPeople.length === 0 ? (
            <p className="muted-copy">Choose at least two friends from the list.</p>
          ) : null}
        </div>

        {createGroupMutation.error ? (
          <InlineAlert tone="danger" onDismiss={() => createGroupMutation.reset()}>
            {getApiErrorMessage(createGroupMutation.error)}
          </InlineAlert>
        ) : null}

        <div className="create-footer">
          <span className={canCreate ? 'ready' : undefined}>
            ● {canCreate ? 'Ready to create' : 'Add a name and two friends'}
          </span>
          <Button
            disabled={!canCreate || createGroupMutation.isPending}
            onClick={() => void handleCreate()}
          >
            {createGroupMutation.isPending ? 'Creating group…' : 'Create group'}
          </Button>
        </div>
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
