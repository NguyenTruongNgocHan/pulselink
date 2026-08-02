import { Avatar } from '@/components/ui/Avatar'
import type { Person } from '@/features/people/types/people.types'
import { SearchInput } from '@/shared/components/form/SearchInput'
import { getInitials } from '@/shared/utils/avatar'

interface MemberPickerProps {
  people: Person[]
  selectedIds: string[]
  query: string
  isLoading: boolean
  onQueryChange: (query: string) => void
  onToggle: (personId: string) => void
}

export function MemberPicker({
  people,
  selectedIds,
  query,
  isLoading,
  onQueryChange,
  onToggle,
}: MemberPickerProps) {
  return (
    <section className="friend-picker">
      <header>
        <div>
          <span className="eyebrow">Invite your circle</span>
          <h2>Add friends</h2>
        </div>
        <span className="selected-count">✓ {selectedIds.length} selected</span>
      </header>

      <div className="notice">
        <span>You will be the group admin. You can transfer this role later.</span>
      </div>

      <SearchInput
        label="Search friends"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onClear={() => onQueryChange('')}
        placeholder="Search friends"
      />

      <div className="member-picker-list" aria-busy={isLoading}>
        {people.map((person) => {
          const selected = selectedIds.includes(person.id)
          return (
            <button
              type="button"
              className={selected ? 'member-picker-row selected' : 'member-picker-row'}
              onClick={() => onToggle(person.id)}
              key={person.id}
              aria-pressed={selected}
            >
              <span className="checkbox" aria-hidden="true">
                {selected ? '✓' : ''}
              </span>
              <Avatar
                initials={getInitials(person.displayName)}
                tone="violet"
                online={person.isOnline}
              />
              <span>
                <b>{person.displayName}</b>
                <small>@{person.username}</small>
              </span>
              <em>{selected ? 'Selected' : 'Add'}</em>
            </button>
          )
        })}
      </div>
    </section>
  )
}
