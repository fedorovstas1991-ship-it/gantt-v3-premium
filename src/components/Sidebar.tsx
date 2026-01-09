import { LayoutDashboard, Users, FolderKanban, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { id: 'schedule', label: 'Расписание', icon: LayoutDashboard },
    { id: 'teams', label: 'Команды', icon: Users },
    { id: 'projects', label: 'Проекты', icon: FolderKanban },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ]

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-logo">
            <div className="logo-icon-circle">
              <LayoutDashboard size={20} strokeWidth={2.5} />
            </div>
            <span className="logo-text">Schedule</span>
          </div>
        )}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Развернуть' : 'Свернуть'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} strokeWidth={2} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user">
            <div className="user-avatar">
              <Users size={16} />
            </div>
            <div className="user-info">
              <div className="user-name">Команда</div>
              <div className="user-email">workspace</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
