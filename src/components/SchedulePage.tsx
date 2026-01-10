import { useState } from 'react'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import { Users, FolderKanban, Calendar, Plus } from 'lucide-react'
import 'gantt-task-react/dist/index.css'

// 🎯 Типы данных
type ViewType = 'projects' | 'teams'

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
  const [viewType, setViewType] = useState<ViewType>('teams')
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month)
  const [columnWidth, setColumnWidth] = useState<number>(70)
  const [teams] = useState<TeamData[]>(mockTeams)
  const [tasks, setTasks] = useState<Task[]>(convertToGanttTasks(mockTeams, 'teams'))

  const handleViewTypeChange = (type: ViewType) => {
    setViewType(type)
    setTasks(convertToGanttTasks(teams, type))
  }

  const handleTaskChange = (task: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(t => t.id === task.id ? task : t)
    )
  }

  const handleAddPerson = () => {
    alert('🎉 Добавление нового человека\n\n(В следующей версии с backend)')
  }

  const totalExecutors = teams.reduce((sum, t) => sum + t.executors.length, 0)
  const totalProjects = new Set(
    teams.flatMap(t => t.executors.flatMap(e => e.projects.map(p => p.projectId)))
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

      {/* Панель управления */}
      <div className="control-panel">
        <div className="view-switcher">
          <button
            className={`view-btn ${viewType === 'teams' ? 'active' : ''}`}
            onClick={() => handleViewTypeChange('teams')}
          >
            <Users size={18} />
            <span>По командам</span>
          </button>
          <button
            className={`view-btn ${viewType === 'projects' ? 'active' : ''}`}
            onClick={() => handleViewTypeChange('projects')}
          >
            <FolderKanban size={18} />
            <span>По проектам</span>
          </button>
        </div>

        <div className="zoom-controls">
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
      </div>

      {/* Gantt График */}
      <div className="gantt-container">
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          onDateChange={handleTaskChange}
          listCellWidth="240px"
          columnWidth={columnWidth}
          locale="ru"
        />
      </div>
    </div>
  )
}
