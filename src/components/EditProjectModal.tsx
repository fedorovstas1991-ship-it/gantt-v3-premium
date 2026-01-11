import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Users } from 'lucide-react'

interface EditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (updatedProject: EditedProject) => void
  onDelete?: () => void
  project: {
    projectId: string
    projectName: string
    start: Date
    end: Date
    hc: number
    color: string
    executorId: string
    executorName: string
  }
  availableProjects: Array<{ id: string; name: string; color: string }>
  availablePeople: Array<{ id: string; name: string }>
}

export interface EditedProject {
  projectId: string
  projectName: string
  start: Date
  end: Date
  hc: number
  color: string
  executorId: string
  status: 'completed' | 'tentative'
  notes: string
}

export function EditProjectModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  project,
  availableProjects,
  availablePeople
}: EditProjectModalProps) {
  const [hoursPerDay, setHoursPerDay] = useState('8')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedExecutorId, setSelectedExecutorId] = useState('')
  const [status, setStatus] = useState<'completed' | 'tentative'>('tentative')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen && project) {
      setHoursPerDay(String(project.hc * 8))
      setStartDate(formatDateForInput(project.start))
      setEndDate(formatDateForInput(project.end))
      setSelectedProjectId(project.projectId)
      setSelectedExecutorId(project.executorId)
      setStatus('tentative')
      setNotes('')
    }
  }, [isOpen, project])

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const calculateTotalHours = (): number => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const workingDays = Math.max(0, days)
    return workingDays * parseFloat(hoursPerDay || '0')
  }

  const calculateWorkingDays = (): number => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  const handleSave = () => {
    const selectedProject = availableProjects.find(p => p.id === selectedProjectId)
    if (!selectedProject) return

    const updatedProject: EditedProject = {
      projectId: selectedProjectId,
      projectName: selectedProject.name,
      start: new Date(startDate),
      end: new Date(endDate),
      hc: parseFloat(hoursPerDay) / 8,
      color: selectedProject.color,
      executorId: selectedExecutorId,
      status,
      notes
    }

    onSave(updatedProject)
    onClose()
  }

  const handleDelete = () => {
    if (onDelete && confirm('Удалить это назначение?')) {
      onDelete()
      onClose()
    }
  }

  const selectedProject = availableProjects.find(p => p.id === selectedProjectId)
  const selectedPerson = availablePeople.find(p => p.id === selectedExecutorId)

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Allocation</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Hours Section */}
          <div className="edit-section">
            <label className="edit-label">Hours</label>
            <div className="hours-grid">
              <div className="hours-input-group">
                <input
                  type="number"
                  className="hours-input"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  min="0.5"
                  max="8"
                  step="0.5"
                />
                <span className="hours-suffix">h/day</span>
              </div>
              <div className="hours-info">
                <span className="hours-label">Total hours</span>
                <span className="hours-value">{calculateTotalHours()}</span>
              </div>
              <div className="hours-info">
                <span className="hours-label">Duration: {calculateWorkingDays()} working days</span>
              </div>
            </div>

            <div className="date-range-display">
              <span>{formatDisplayDate(startDate)}</span>
              <span className="date-arrow">›</span>
              <span>{formatDisplayDate(endDate)}</span>
            </div>

            <div className="date-inputs">
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="edit-row">
              <span className="edit-toggle-label">Specific time</span>
              <button className="edit-toggle-btn">↻</button>
            </div>

            <div className="edit-row">
              <span className="edit-dropdown-label">Doesn't repeat</span>
              <button className="edit-dropdown-btn">▼</button>
            </div>
          </div>

          {/* Project Section */}
          <div className="edit-section">
            <label className="edit-label">Project</label>
            <div className="project-select-wrapper">
              <div
                className="project-color-indicator"
                style={{ backgroundColor: selectedProject?.color || '#ccc' }}
              />
              <select
                className="project-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {availableProjects.map(proj => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="project-actions">
              <button className="link-btn">Add task</button>
              <button className="link-btn">Edit project</button>
            </div>
          </div>

          {/* Allocation Status */}
          <div className="edit-section">
            <label className="edit-label">Allocation Status</label>
            <div className="status-buttons">
              <button
                className={`status-btn ${status === 'completed' ? 'active' : ''}`}
                onClick={() => setStatus('completed')}
              >
                Completed
              </button>
              <button
                className={`status-btn ${status === 'tentative' ? 'active' : ''}`}
                onClick={() => setStatus('tentative')}
              >
                Tentative
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="edit-section">
            <label className="edit-label">Notes</label>
            <textarea
              className="notes-textarea"
              placeholder="Add details specific to this allocation"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Assigned to */}
          <div className="edit-section">
            <label className="edit-label">Assigned to</label>
            <div className="assigned-to-wrapper">
              <select
                className="assigned-select"
                value={selectedExecutorId}
                onChange={(e) => setSelectedExecutorId(e.target.value)}
              >
                {availablePeople.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
              {selectedPerson && (
                <button
                  className="remove-assigned-btn"
                  onClick={() => setSelectedExecutorId('')}
                  title="Remove assignment"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="edit-footer-info">
            <Clock size={14} />
            <span>Updated by {project.executorName} just now</span>
            <button className="link-btn">View changes</button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={handleSave}>
            Update
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <div className="footer-actions">
            <button className="actions-dropdown-btn">
              Actions ▼
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
