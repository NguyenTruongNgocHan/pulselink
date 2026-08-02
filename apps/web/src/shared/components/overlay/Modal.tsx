import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { Icon } from '@/components/ui/Icon'

interface ModalProps {
  isOpen: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({
  isOpen,
  title,
  description,
  children,
  footer,
  onClose,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.classList.add('modal-open')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`modal-card modal-card--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-card__header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">
            <Icon name="x" />
          </button>
        </header>
        <div className="modal-card__body">{children}</div>
        {footer ? <footer className="modal-card__footer">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  )
}
