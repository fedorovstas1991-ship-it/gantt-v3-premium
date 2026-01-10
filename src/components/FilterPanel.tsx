import { Filter, X } from 'lucide-react'

export interface Filters {
  teams: string[]
  people: string[]
  projectName: string
  dateFrom: string
  dateTo: string
}

interface FilterPanelProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  teams: Array<{ id: string; name: string }>
  people: Array<{ id: string; name: string }>
}

export function FilterPanel({ filters, onFiltersChange, teams, people }: FilterPanelProps) {
  const handleTeamToggle = (teamId: string) => {
    const newTeams = filters.teams.includes(teamId)
      ? filters.teams.filter(id => id !== teamId)
      : [...filters.teams, teamId]
    onFiltersChange({ ...filters, teams: newTeams })
  }

  const handlePersonToggle = (personId: string) => {
    const newPeople = filters.people.includes(personId)
      ? filters.people.filter(id => id !== personId)
      : [...filters.people, personId]
    onFiltersChange({ ...filters, people: newPeople })
  }

  const handleClearAll = () => {
    onFiltersChange({
      teams: [],
      people: [],
      projectName: '',
      dateFrom: '',
      dateTo: ''
    })
  }

  const hasActiveFilters = filters.teams.length > 0 || filters.people.length > 0 ||
                           filters.projectName || filters.dateFrom || filters.dateTo

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <div className="filter-title">
          <Filter size={16} />
          <span>Фильтры</span>
        </div>
        {hasActiveFilters && (
          <button className="btn-clear-filters" onClick={handleClearAll}>
            <X size={14} />
            <span>Очистить</span>
          </button>
        )}
      </div>

      <div className="filter-content">
        {/* Фильтр по названию проекта */}
        <div className="filter-group">
          <label className="filter-label">Название проекта</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Поиск..."
            value={filters.projectName}
            onChange={(e) => onFiltersChange({ ...filters, projectName: e.target.value })}
          />
        </div>

        {/* Фильтр по командам */}
        <div className="filter-group">
          <label className="filter-label">Команды</label>
          <div className="filter-checkboxes">
            {teams.map(team => (
              <label key={team.id} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.teams.includes(team.id)}
                  onChange={() => handleTeamToggle(team.id)}
                />
                <span>{team.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Фильтр по людям */}
        <div className="filter-group">
          <label className="filter-label">Люди</label>
          <div className="filter-checkboxes">
            {people.map(person => (
              <label key={person.id} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.people.includes(person.id)}
                  onChange={() => handlePersonToggle(person.id)}
                />
                <span>{person.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Фильтр по датам */}
        <div className="filter-group">
          <label className="filter-label">Период</label>
          <div className="filter-dates">
            <input
              type="date"
              className="filter-input"
              value={filters.dateFrom}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
            />
            <span>—</span>
            <input
              type="date"
              className="filter-input"
              value={filters.dateTo}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
