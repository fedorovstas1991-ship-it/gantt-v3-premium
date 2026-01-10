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

function formatDate(date: Date | null): string {
  if (!date) return '—'
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

export function PersonCard({ executor, team }: PersonCardProps) {
  const { start, end } = getDateRange(executor)
  const totalHours = getTotalHours(executor)

  return (
    <div className="person-card">
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
    </div>
  )
}
