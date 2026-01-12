import { TeamData, ExecutorData } from './SchedulePage'

interface PersonCardRowProps {
  executor: ExecutorData
  team: TeamData
  onClick?: () => void
  onUtilizationClick?: () => void
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getTotalDays(executor: ExecutorData): number {
  if (!executor.projects || executor.projects.length === 0) return 0

  // Считаем общую длительность всех проектов в днях
  const totalDays = executor.projects.reduce((sum, project) => {
    const days = Math.ceil((project.end.getTime() - project.start.getTime()) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)

  return totalDays
}

function getUtilization(executor: ExecutorData): number {
  // Утилизация = сумма всех HC проектов * 100%
  return (executor.projects || []).reduce((sum, p) => sum + p.hc, 0) * 100
}

function getUtilizationColor(utilization: number): string {
  if (utilization <= 100) return 'var(--brand-default)' // Синий - нормальная загрузка
  if (utilization <= 120) return '#ff9500' // Оранжевый - полная загрузка
  return '#ff3b30' // Красный - перегрузка
}

/**
 * Simplified horizontal person card row component for Gantt sidebar
 * Matches Plane.io design with 44px height
 */
export function PersonCardRow({ executor, team, onClick, onUtilizationClick }: PersonCardRowProps) {
  const totalDays = getTotalDays(executor)
  const utilization = getUtilization(executor)
  const utilizationColor = getUtilizationColor(utilization)

  const handleUtilizationClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onUtilizationClick?.()
  }

  return (
    <div className="gantt-person-row" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Avatar */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: team.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 'var(--text-12)',
          fontWeight: 'var(--font-weight-semibold)',
          flexShrink: 0,
          marginLeft: '0.75rem'
        }}
      >
        {getInitials(executor.name)}
      </div>

      {/* Name and Team */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span
          style={{
            fontSize: 'var(--text-13)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--txt-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {executor.name}
        </span>
        <span
          style={{
            fontSize: 'var(--text-11)',
            color: 'var(--txt-tertiary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {team.name}
        </span>
      </div>

      {/* Duration */}
      <span
        style={{
          fontSize: 'var(--text-12)',
          color: 'var(--txt-secondary)',
          flexShrink: 0
        }}
      >
        {totalDays} дн
      </span>

      {/* Utilization indicator (clickable) */}
      <div
        onClick={handleUtilizationClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: 'var(--bg-layer-transparent)',
          cursor: onUtilizationClick ? 'pointer' : 'default',
          transition: 'background-color 0.15s ease',
          flexShrink: 0
        }}
        title="Нажмите для фильтрации по этому человеку"
        onMouseEnter={(e) => {
          if (onUtilizationClick) {
            e.currentTarget.style.backgroundColor = 'var(--bg-layer-transparent-hover)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-layer-transparent)'
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-12)',
            fontWeight: 'var(--font-weight-medium)',
            color: utilizationColor
          }}
        >
          {utilization.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}
