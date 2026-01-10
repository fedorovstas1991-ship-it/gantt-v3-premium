import { Users, Calendar, Clock } from 'lucide-react'

interface ExecutorData {
  id: string
  name: string
  teamId: string
  projects: Array<{
    start: Date
    end: Date
    hc: number
  }>
}

interface TeamData {
  name: string
  color: string
}

interface PersonCardProps {
  executor: ExecutorData
  team: TeamData
  onClick?: () => void
  onUtilizationClick?: () => void
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getDateRange(executor: ExecutorData) {
  if (!executor.projects.length) return { start: null, end: null }
  const dates = executor.projects.flatMap(p => [p.start, p.end])
  return {
    start: new Date(Math.min(...dates.map(d => d.getTime()))),
    end: new Date(Math.max(...dates.map(d => d.getTime())))
  }
}

function getTotalHours(executor: ExecutorData): number {
  return executor.projects.reduce((sum, p) => sum + (p.hc * 40), 0)
}

function getUtilization(executor: ExecutorData): number {
  // Утилизация = сумма всех HC проектов * 100%
  return executor.projects.reduce((sum, p) => sum + p.hc, 0) * 100
}

function getUtilizationColor(utilization: number): string {
  if (utilization <= 100) return '#34c759' // Зеленый - нормальная загрузка
  if (utilization <= 120) return '#ff9500' // Оранжевый - полная загрузка
  return '#ff3b30' // Красный - перегрузка
}

function formatDate(date: Date | null): string {
  if (!date) return '—'
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

export function PersonCard({ executor, team, onClick, onUtilizationClick }: PersonCardProps) {
  const { start, end } = getDateRange(executor)
  const totalHours = getTotalHours(executor)
  const utilization = getUtilization(executor)
  const utilizationColor = getUtilizationColor(utilization)

  const handleUtilizationClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Не запускать onClick карточки
    onUtilizationClick?.()
  }

  return (
    <div className="person-card" onClick={onClick}>
      <div className="person-card-header">
        <div className="person-avatar" style={{ backgroundColor: team.color }}>
          {getInitials(executor.name)}
        </div>
        <h3 className="person-name">{executor.name}</h3>
      </div>

      <div className="person-info">
        <div className="person-info-row">
          <Users size={14} />
          <span>{team.name}</span>
        </div>
        <div className="person-info-row">
          <Calendar size={14} />
          <span>{formatDate(start)} — {formatDate(end)}</span>
        </div>
        <div className="person-info-row">
          <Clock size={14} />
          <span>{totalHours}h</span>
        </div>
      </div>

      {/* Индикатор утилизации */}
      <div
        className="person-utilization"
        onClick={handleUtilizationClick}
        title="Нажмите для фильтрации по этому человеку"
      >
        <div className="utilization-header">
          <span className="utilization-label">Утилизация</span>
          <span className="utilization-value" style={{ color: utilizationColor }}>
            {utilization.toFixed(0)}%
          </span>
        </div>
        <div className="utilization-bar-bg">
          <div
            className="utilization-bar-fill"
            style={{
              width: `${Math.min(utilization, 100)}%`,
              backgroundColor: utilizationColor
            }}
          />
        </div>
      </div>
    </div>
  )
}
