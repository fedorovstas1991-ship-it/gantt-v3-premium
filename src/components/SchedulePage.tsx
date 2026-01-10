import { useState, useMemo } from 'react'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import { Users, FolderKanban, Calendar, Plus } from 'lucide-react'
import { PersonCard } from './PersonCard'
import { FilterPanel, Filters } from './FilterPanel'
import { ProjectModal, NewProject } from './ProjectModal'
import { useLocalStorage } from '../hooks/useLocalStorage'
import 'gantt-task-react/dist/index.css'

// 🎯 Типы данных
type ViewType = 'projects' | 'teams' // Оставляем для будущего функционала

interface TeamData {
  id: string
  name: string
  color: string
  executors: ExecutorData[]
}

interface ExecutorData {
  id: string
  name: string
  avatar?: string
  teamId: string
  projects: ProjectAssignment[]
}

interface ProjectAssignment {
  projectId: string
  projectName: string
  start: Date
  end: Date
  hc: number
  color: string
}

// 🎨 МОКОВЫЕ ДАННЫЕ
const mockTeams: TeamData[] = [
  {
    id: 'team-dev',
    name: 'Разработка',
    color: '#007aff',
    executors: [
      {
        id: 'exec-1',
        name: 'Иванов Иван',
        teamId: 'team-dev',
        projects: [
          {
            projectId: 'proj-alice',
            projectName: 'Alice Voice',
            start: new Date(2026, 0, 5),
            end: new Date(2026, 2, 20),
            hc: 0.8,
            color: '#af52de'
          },
          {
            projectId: 'proj-search',
            projectName: 'Search Integration',
            start: new Date(2026, 2, 25),
            end: new Date(2026, 4, 15),
            hc: 1.0,
            color: '#34c759'
          }
        ]
      },
      {
        id: 'exec-2',
        name: 'Петрова Мария',
        teamId: 'team-dev',
        projects: [
          {
            projectId: 'proj-alice',
            projectName: 'Alice Voice',
            start: new Date(2026, 0, 10),
            end: new Date(2026, 3, 30),
            hc: 1.0,
            color: '#af52de'
          }
        ]
      },
      {
        id: 'exec-3',
        name: 'Сидоров Петр',
        teamId: 'team-dev',
        projects: [
          {
            projectId: 'proj-analytics',
            projectName: 'Analytics Dashboard',
            start: new Date(2026, 1, 1),
            end: new Date(2026, 5, 30),
            hc: 0.5,
            color: '#ff9500'
          }
        ]
      }
    ]
  },
  {
    id: 'team-design',
    name: 'Дизайн',
    color: '#af52de',
    executors: [
      {
        id: 'exec-4',
        name: 'Козлов Дмитрий',
        teamId: 'team-design',
        projects: [
          {
            projectId: 'proj-alice',
            projectName: 'Alice Voice',
            start: new Date(2026, 0, 15),
            end: new Date(2026, 2, 1),
            hc: 0.6,
            color: '#af52de'
          }
        ]
      },
      {
        id: 'exec-5',
        name: 'Новикова Анна',
        teamId: 'team-design',
        projects: [
          {
            projectId: 'proj-search',
            projectName: 'Search Integration',
            start: new Date(2026, 1, 10),
            end: new Date(2026, 3, 20),
            hc: 0.8,
            color: '#34c759'
          }
        ]
      }
    ]
  },
  {
    id: 'team-qa',
    name: 'QA',
    color: '#34c759',
    executors: [
      {
        id: 'exec-6',
        name: 'Морозов Алексей',
        teamId: 'team-qa',
        projects: [
          {
            projectId: 'proj-alice',
            projectName: 'Alice Voice',
            start: new Date(2026, 2, 1),
            end: new Date(2026, 3, 15),
            hc: 1.0,
            color: '#af52de'
          },
          {
            projectId: 'proj-analytics',
            projectName: 'Analytics Dashboard',
            start: new Date(2026, 3, 20),
            end: new Date(2026, 5, 30),
            hc: 0.7,
            color: '#ff9500'
          }
        ]
      }
    ]
  }
]

// 🔍 Применение фильтров (паттерн Plane - real-time)
function applyFilters(teams: TeamData[], filters: Filters): TeamData[] {
  return teams.map(team => {
    // Фильтр по командам
    if (filters.teams.length > 0 && !filters.teams.includes(team.id)) {
      return { ...team, executors: [] }
    }

    const filteredExecutors = team.executors
      .filter(executor => {
        // Фильтр по людям
        if (filters.people.length > 0 && !filters.people.includes(executor.id)) {
          return false
        }
        return true
      })
      .map(executor => {
        const filteredProjects = executor.projects.filter(project => {
          // Фильтр по названию проекта
          if (filters.projectName && !project.projectName.toLowerCase().includes(filters.projectName.toLowerCase())) {
            return false
          }

          // Фильтр по датам
          if (filters.dateFrom) {
            const dateFrom = new Date(filters.dateFrom)
            if (project.end < dateFrom) return false
          }
          if (filters.dateTo) {
            const dateTo = new Date(filters.dateTo)
            if (project.start > dateTo) return false
          }

          return true
        })

        return { ...executor, projects: filteredProjects }
      })
      .filter(executor => executor.projects.length > 0)

    return { ...team, executors: filteredExecutors }
  }).filter(team => team.executors.length > 0)
}

// 🎨 Конвертация в Gantt формат
function convertToGanttTasks(teams: TeamData[], viewType: ViewType): Task[] {
  const tasks: Task[] = []

  if (viewType === 'teams') {
    teams.forEach(team => {
      tasks.push({
        start: new Date(2026, 0, 1),
        end: new Date(2026, 5, 30),
        name: `${team.name}`,
        id: `team-${team.id}`,
        type: 'project',
        progress: 0,
        isDisabled: true,
        styles: {
          backgroundColor: team.color,
          progressColor: team.color,
          backgroundSelectedColor: team.color
        }
      })

      team.executors.forEach(executor => {
        tasks.push({
          start: new Date(2026, 0, 1),
          end: new Date(2026, 5, 30),
          name: `  ${executor.name}`,
          id: `exec-${executor.id}`,
          type: 'project',
          project: `team-${team.id}`,
          progress: 0,
          isDisabled: true,
          styles: {
            backgroundColor: 'transparent',
            progressColor: 'transparent',
            backgroundSelectedColor: 'transparent'
          }
        })

        executor.projects.forEach((proj, idx) => {
          tasks.push({
            start: proj.start,
            end: proj.end,
            name: `${proj.projectName}`,
            id: `${executor.id}-proj-${idx}`,
            type: 'task',
            project: `exec-${executor.id}`,
            progress: Math.round((proj.hc / 1.0) * 100),
            styles: {
              backgroundColor: proj.color,
              progressColor: proj.color,
              backgroundSelectedColor: proj.color
            }
          })
        })
      })
    })
  } else {
    const projectsMap = new Map<string, { name: string, color: string, teams: Map<string, ExecutorData[]> }>()

    teams.forEach(team => {
      team.executors.forEach(executor => {
        executor.projects.forEach(proj => {
          if (!projectsMap.has(proj.projectId)) {
            projectsMap.set(proj.projectId, {
              name: proj.projectName,
              color: proj.color,
              teams: new Map()
            })
          }
          const project = projectsMap.get(proj.projectId)!
          if (!project.teams.has(team.id)) {
            project.teams.set(team.id, [])
          }
          project.teams.get(team.id)!.push(executor)
        })
      })
    })

    projectsMap.forEach((project, projectId) => {
      tasks.push({
        start: new Date(2026, 0, 1),
        end: new Date(2026, 5, 30),
        name: `${project.name}`,
        id: `project-${projectId}`,
        type: 'project',
        progress: 0,
        isDisabled: true,
        styles: {
          backgroundColor: project.color,
          progressColor: project.color,
          backgroundSelectedColor: project.color
        }
      })

      project.teams.forEach((executors, teamId) => {
        const team = teams.find(t => t.id === teamId)!

        tasks.push({
          start: new Date(2026, 0, 1),
          end: new Date(2026, 5, 30),
          name: `  ${team.name}`,
          id: `${projectId}-team-${teamId}`,
          type: 'project',
          project: `project-${projectId}`,
          progress: 0,
          isDisabled: true,
          styles: {
            backgroundColor: 'transparent',
            progressColor: 'transparent',
            backgroundSelectedColor: 'transparent'
          }
        })

        executors.forEach(executor => {
          const proj = executor.projects.find(p => p.projectId === projectId)!

          tasks.push({
            start: proj.start,
            end: proj.end,
            name: `    ${executor.name}`,
            id: `${projectId}-${executor.id}`,
            type: 'task',
            project: `${projectId}-team-${teamId}`,
            progress: Math.round((proj.hc / 1.0) * 100),
            styles: {
              backgroundColor: proj.color,
              progressColor: proj.color,
              backgroundSelectedColor: proj.color
            }
          })
        })
      })
    })
  }

  return tasks
}

export function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month)
  const [columnWidth, setColumnWidth] = useState<number>(70)
  const [teams, setTeams] = useState<TeamData[]>(mockTeams)

  // Фильтры с сохранением в localStorage (паттерн Plane)
  const [filters, setFilters] = useLocalStorage<Filters>('gantt-filters', {
    teams: [],
    people: [],
    projectName: '',
    dateFrom: '',
    dateTo: ''
  })

  // Состояние модального окна создания проекта
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedExecutorId, setSelectedExecutorId] = useState<string | undefined>()
  const [modalInitialDates, setModalInitialDates] = useState<{ start?: Date; end?: Date }>({})

  // Real-time фильтрация (useMemo для оптимизации)
  const filteredTeams = useMemo(() => applyFilters(teams, filters), [teams, filters])

  // Преобразование в Gantt tasks
  const tasks = useMemo(() => convertToGanttTasks(filteredTeams, 'teams'), [filteredTeams])

  const handleTaskChange = (task: Task) => {
    // Обновление дат проекта при drag&drop (горизонтальное перемещение)
    // Примечание: gantt-task-react поддерживает изменение дат, но не поддерживает
    // нативное перемещение задач между строками (reassignment)
    // task.id имеет формат: "{executorId}-proj-{idx}"
    const taskIdParts = task.id.split('-')

    // Проверяем, что это задача проекта (а не team или exec)
    if (taskIdParts.includes('proj')) {
      const projIndex = taskIdParts.indexOf('proj')
      const executorId = taskIdParts.slice(0, projIndex).join('-')
      const projectIdx = parseInt(taskIdParts[projIndex + 1])

      setTeams(prevTeams => {
        return prevTeams.map(team => {
          return {
            ...team,
            executors: team.executors.map(executor => {
              if (executor.id === executorId) {
                const updatedProjects = [...executor.projects]
                if (updatedProjects[projectIdx]) {
                  updatedProjects[projectIdx] = {
                    ...updatedProjects[projectIdx],
                    start: task.start,
                    end: task.end
                  }
                }
                return {
                  ...executor,
                  projects: updatedProjects
                }
              }
              return executor
            })
          }
        })
      })
    }
  }

  const handleAddPerson = () => {
    alert('🎉 Добавление нового человека\n\n(В следующей версии с backend)')
  }

  // Открыть модальное окно для создания проекта
  const handleOpenProjectModal = (executorId: string, startDate?: Date, endDate?: Date) => {
    setSelectedExecutorId(executorId)
    setModalInitialDates({ start: startDate, end: endDate })
    setIsModalOpen(true)
  }

  // Сохранить новый проект
  const handleSaveProject = (newProject: NewProject) => {
    if (!selectedExecutorId) return

    setTeams(prevTeams => {
      return prevTeams.map(team => {
        return {
          ...team,
          executors: team.executors.map(executor => {
            if (executor.id === selectedExecutorId) {
              return {
                ...executor,
                projects: [
                  ...executor.projects,
                  {
                    projectId: `proj-${Date.now()}`,
                    projectName: newProject.projectName,
                    start: newProject.start,
                    end: newProject.end,
                    hc: newProject.hc,
                    color: newProject.color
                  }
                ]
              }
            }
            return executor
          })
        }
      })
    })

    setIsModalOpen(false)
    setSelectedExecutorId(undefined)
    setModalInitialDates({})
  }

  // Фильтрация по одному человеку (клик на индикатор утилизации)
  const handleFilterByPerson = (personId: string) => {
    setFilters(prev => ({
      ...prev,
      people: [personId]
    }))
  }

  // Подготовка данных для FilterPanel
  const teamsList = teams.map(t => ({ id: t.id, name: t.name }))
  const peopleList = teams.flatMap(t => t.executors.map(e => ({ id: e.id, name: e.name })))

  const totalExecutors = filteredTeams.reduce((sum, t) => sum + t.executors.length, 0)
  const totalProjects = new Set(
    filteredTeams.flatMap(t => t.executors.flatMap(e => e.projects.map(p => p.projectId)))
  ).size

  return (
    <div className="schedule-page">
      {/* Header с статистикой */}
      <div className="page-header">
        <div className="header-content">
          <h1>Расписание</h1>
          <div className="header-stats">
            <div className="stat-badge">
              <Users size={16} />
              <span>{totalExecutors} человек</span>
            </div>
            <div className="stat-badge">
              <FolderKanban size={16} />
              <span>{totalProjects} проектов</span>
            </div>
            <div className="stat-badge">
              <Calendar size={16} />
              <span>Янв–Июнь 2026</span>
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={handleAddPerson}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Добавить</span>
        </button>
      </div>

      {/* Панель фильтров */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        teams={teamsList}
        people={peopleList}
      />

      {/* Split Layout: Карточки слева + Gantt справа */}
      <div className="schedule-split-layout">
        {/* Левая панель - карточки людей */}
        <div className="people-cards-panel">
          <div className="cards-list">
            {teams.map(team =>
              team.executors.map(executor => (
                <PersonCard
                  key={executor.id}
                  executor={executor}
                  team={team}
                  onClick={() => handleOpenProjectModal(executor.id, new Date(2026, 0, 10), new Date(2026, 2, 10))}
                  onUtilizationClick={() => handleFilterByPerson(executor.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Правая панель - Gantt диаграмма */}
        <div className="gantt-panel">
          {/* Кнопки масштаба НАД диаграммой */}
          <div className="gantt-zoom-controls">
            <button
              className={`zoom-btn ${viewMode === ViewMode.Week ? 'active' : ''}`}
              onClick={() => {
                setViewMode(ViewMode.Week)
                setColumnWidth(50)
              }}
            >
              Неделя
            </button>
            <button
              className={`zoom-btn ${viewMode === ViewMode.Month && columnWidth >= 50 ? 'active' : ''}`}
              onClick={() => {
                setViewMode(ViewMode.Month)
                setColumnWidth(70)
              }}
            >
              Месяц
            </button>
            <button
              className={`zoom-btn ${viewMode === ViewMode.Month && columnWidth < 50 ? 'active' : ''}`}
              onClick={() => {
                setViewMode(ViewMode.Month)
                setColumnWidth(30)
              }}
            >
              Полугодие
            </button>
          </div>

          {/* Gantt График */}
          <div className="gantt-container">
            <Gantt
              tasks={tasks}
              viewMode={viewMode}
              onDateChange={handleTaskChange}
              listCellWidth="0px"
              columnWidth={columnWidth}
              locale="ru"
              barBackgroundColor="transparent"
              barProgressColor="transparent"
            />
          </div>
        </div>
      </div>

      {/* Модальное окно создания проекта */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        executorId={selectedExecutorId}
        executorName={
          selectedExecutorId
            ? teams.flatMap(t => t.executors).find(e => e.id === selectedExecutorId)?.name
            : undefined
        }
        initialStartDate={modalInitialDates.start}
        initialEndDate={modalInitialDates.end}
      />
    </div>
  )
}
