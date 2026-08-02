import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
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
    <section className="group-member-picker">
      <header className="group-member-picker__header">
        <div>
          <span className="eyebrow">Invite your circle</span>
          <h2>Add friends</h2>
          <p>Select the people who should be part of this group.</p>
        </div>

        <span className="group-member-picker__count">
          {selectedIds.length} selected
        </span>
      </header>

      <div className="group-member-picker__search">
        <SearchInput
          label="Search friends"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onClear={() => onQueryChange('')}
          placeholder="Search friends"
        />
      </div>

      <div className="group-member-picker__notice">
        <Icon name="shield" size={17} />
        <span>
          <b>You will be the first admin.</b>
          <small>The role can be transferred later.</small>
        </span>
      </div>

      <div className="group-member-picker__list" aria-busy={isLoading}>
        {people.map((person) => {
          const selected = selectedIds.includes(person.id)

          return (
            <button
              type="button"
              className={
                selected
                  ? 'group-member-picker__row selected'
                  : 'group-member-picker__row'
              }
              onClick={() => onToggle(person.id)}
              key={person.id}
              aria-pressed={selected}
            >
              <span className="group-member-picker__checkbox" aria-hidden="true">
                {selected ? <Icon name="check" size={14} /> : null}
              </span>

              <Avatar
                initials={getInitials(person.displayName)}
                tone="violet"
                online={person.isOnline}
              />

              <span className="group-member-picker__identity">
                <b>{person.displayName}</b>
                <small>@{person.username}</small>
              </span>

              <span className="group-member-picker__state">
                {selected ? 'Selected' : 'Add'}
              </span>
            </button>
          )
        })}

        {!isLoading && people.length === 0 ? (
          <div className="group-member-picker__empty">
            <Icon name="search" size={22} />
            <span>
              <b>No friends found</b>
              <small>Try another name or username.</small>
            </span>
          </div>
        ) : null}
      </div>
    </section>
  )
}