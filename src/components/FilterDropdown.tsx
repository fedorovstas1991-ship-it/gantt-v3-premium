import { useState, useRef, useEffect } from 'react'
import { Filter, X, Search, ChevronRight } from 'lucide-react'

export interface Filters {
  teams: string[]
  people: string[]
  projects: string[]
  projectName: string
  dateFrom: string
  dateTo: string
}

interface FilterDropdownProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  teams: Array<{ id: string; name: string }>
  people: Array<{ id: string; name: string }>
  projects: Array<{ id: string; name: string }>
}

type FilterCategory = 'teams' | 'people' | 'projects' | 'search'

export function FilterDropdown({ filters, onFiltersChange, teams, people, projects }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<FilterCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveCategory(null)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleToggleTeam = (teamId: string) => {
    const newTeams = filters.teams.includes(teamId)
      ? filters.teams.filter(id => id !== teamId)
      : [...filters.teams, teamId]
    onFiltersChange({ ...filters, teams: newTeams })
  }

const handleTogglePerson = (personId: string) => {
  const newPeople = (filters.people || []).includes(personId)
    ? (filters.people || []).filter(id => id !== personId)
    : [...(filters.people || []), personId]
  onFiltersChange({ ...filters, people: newPeople })
}

const handleToggleProject = (projectId: string) => {
  const newProjects = (filters.projects || []).includes(projectId)
    ? (filters.projects || []).filter(id => id !== projectId)
    : [...(filters.projects || []), projectId]
  onFiltersChange({ ...filters, projects: newProjects })
}


  const handleClearAll = () => {
    onFiltersChange({
      teams: [],
      people: [],
      projects: [],
      projectName: '',
      dateFrom: '',
      dateTo: ''
    })
  }

const activeFiltersCount = 
  [...(filters.teams || []), ...(filters.people || []), ...(filters.projects || [])].length +
  (filters.projectName ? 1 : 0) + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0)



  return (
    <div className="filter-dropdown-wrapper" ref={dropdownRef}>
      <button
        className={`filter-dropdown-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={16} />
        <span>Filter</span>
        {activeFiltersCount > 0 && (
          <span className="filter-badge">{activeFiltersCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="filter-dropdown-menu">
          <div className="filter-dropdown-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-search-input"
            />
          </div>

          <div className="filter-categories">
            <div
              className="filter-category-item"
              onMouseEnter={() => setActiveCategory('people')}
            >
              <span>Person</span>
              <ChevronRight size={16} />

              {activeCategory === 'people' && (
                <div className="filter-submenu">
                  <div className="filter-submenu-operators">
                    <button className="operator-btn active">is</button>
                    <button className="operator-btn">is not</button>
                  </div>
                  <div className="filter-submenu-options">
                    {people
                      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(person => (
                        <label key={person.id} className="filter-option">
                          <input
                            type="checkbox"
                            checked={filters.people.includes(person.id)}
                            onChange={() => handleTogglePerson(person.id)}
                          />
                          <span>{person.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className="filter-category-item"
              onMouseEnter={() => setActiveCategory('teams')}
            >
              <span>Team</span>
              <ChevronRight size={16} />

              {activeCategory === 'teams' && (
                <div className="filter-submenu">
                  <div className="filter-submenu-operators">
                    <button className="operator-btn active">is</button>
                    <button className="operator-btn">is not</button>
                  </div>
                  <div className="filter-submenu-options">
                    {teams
                      .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(team => (
                        <label key={team.id} className="filter-option">
                          <input
                            type="checkbox"
                            checked={filters.teams.includes(team.id)}
                            onChange={() => handleToggleTeam(team.id)}
                          />
                          <span>{team.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className="filter-category-item"
              onMouseEnter={() => setActiveCategory('projects')}
            >
              <span>Project</span>
              <ChevronRight size={16} />

              {activeCategory === 'projects' && (
                <div className="filter-submenu">
                  <div className="filter-submenu-operators">
                    <button className="operator-btn active">is</button>
                    <button className="operator-btn">is not</button>
                  </div>
                  <div className="filter-submenu-options">
                    {projects
                      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(project => (
                        <label key={project.id} className="filter-option">
                          <input
                            type="checkbox"
                            checked={filters.projects?.includes(project.id) || false}
                            onChange={() => handleToggleProject(project.id)}
                          />
                          <span>{project.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="filter-dropdown-footer">
              <button className="btn-clear-all" onClick={handleClearAll}>
                <X size={14} />
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
