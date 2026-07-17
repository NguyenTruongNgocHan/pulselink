import { useEffect, useState } from 'react'
import { Icon } from './components'

type Theme = 'light' | 'dark' | 'system'

function applyTheme(theme: Theme) {
  const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = theme === 'dark' || (theme === 'system' && prefersDark)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

export function ThemeControl({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('pulselink-theme') as Theme) || 'system')
  const options: Theme[] = ['light', 'dark', 'system']

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('pulselink-theme', theme)
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handle = () => theme === 'system' && applyTheme('system')
    media.addEventListener('change', handle)
    return () => media.removeEventListener('change', handle)
  }, [theme])

  const next = () => setTheme(options[(options.indexOf(theme) + 1) % options.length])
  const icon = theme === 'light' ? 'sun' : theme === 'dark' ? 'moon' : 'monitor'
  return (
    <button className={compact ? 'icon-button' : 'theme-control'} type="button" onClick={next} aria-label={`Theme: ${theme}. Change theme`} title={`Theme: ${theme}`}>
      <Icon name={icon} size={18} />{!compact && <span>{theme}</span>}
    </button>
  )
}
