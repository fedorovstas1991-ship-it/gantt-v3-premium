import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    { value: 'light' as const, label: 'Светлая', icon: Sun },
    { value: 'dark' as const, label: 'Темная', icon: Moon },
    { value: 'system' as const, label: 'Системная', icon: Monitor },
  ]

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Настройки</h1>
        <p>Управление параметрами приложения</p>
      </div>

      <div className="settings-section">
        <h2>Внешний вид</h2>

        <div className="setting-item">
          <div className="setting-label">
            <h3>Тема оформления</h3>
            <p>Выберите цветовую схему интерфейса</p>
          </div>

          <div className="theme-selector">
            {themeOptions.map(option => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  className={`theme-option ${theme === option.value ? 'active' : ''}`}
                  onClick={() => setTheme(option.value)}
                >
                  <Icon size={20} strokeWidth={2} />
                  <span>{option.label}</span>
                  {theme === option.value && (
                    <div className="theme-check">✓</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>О приложении</h2>

        <div className="setting-item">
          <div className="about-info">
            <div className="about-row">
              <span className="about-label">Версия:</span>
              <span className="about-value">3.0.0 Premium</span>
            </div>
            <div className="about-row">
              <span className="about-label">Дизайн:</span>
              <span className="about-value">Apple-inspired UI</span>
            </div>
            <div className="about-row">
              <span className="about-label">Иконки:</span>
              <span className="about-value">Lucide Icons</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
