import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: NewProject) => void
  executorId?: string
  executorName?: string
  initialStartDate?: Date
  initialEndDate?: Date
}

export interface NewProject {
  projectName: string
  start: Date
  end: Date
  hc: number
  color: string
}

const PRESET_COLORS = [
  { name: 'Фиолетовый', value: '#af52de' },
  { name: 'Зеленый', value: '#34c759' },
  { name: 'Оранжевый', value: '#ff9500' },
  { name: 'Синий', value: '#007aff' },
  { name: 'Розовый', value: '#ff2d55' },
  { name: 'Бирюзовый', value: '#5ac8fa' }
]

export function ProjectModal({
  isOpen,
  onClose,
  onSave,
  executorName,
  initialStartDate,
  initialEndDate
}: ProjectModalProps) {
  const [projectName, setProjectName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [hc, setHc] = useState('1.0')
  const [color, setColor] = useState(PRESET_COLORS[0].value)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Инициализация дат при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      if (initialStartDate) {
        setStartDate(formatDateForInput(initialStartDate))
      }
      if (initialEndDate) {
        setEndDate(formatDateForInput(initialEndDate))
      }
    }
  }, [isOpen, initialStartDate, initialEndDate])

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!projectName.trim()) {
      newErrors.projectName = 'Название проекта обязательно'
    }

    if (!startDate) {
      newErrors.startDate = 'Дата начала обязательна'
    }

    if (!endDate) {
      newErrors.endDate = 'Дата окончания обязательна'
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'Дата окончания должна быть после даты начала'
    }

    const hcNum = parseFloat(hc)
    if (isNaN(hcNum) || hcNum < 0.1 || hcNum > 1.0) {
      newErrors.hc = 'HC должен быть от 0.1 до 1.0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const newProject: NewProject = {
      projectName: projectName.trim(),
      start: new Date(startDate),
      end: new Date(endDate),
      hc: parseFloat(hc),
      color
    }

    onSave(newProject)
    handleClose()
  }

  const handleClose = () => {
    setProjectName('')
    setStartDate('')
    setEndDate('')
    setHc('1.0')
    setColor(PRESET_COLORS[0].value)
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Создать проект</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {executorName && (
          <div className="modal-info">
            <span className="modal-info-label">Исполнитель:</span>
            <span className="modal-info-value">{executorName}</span>
          </div>
        )}

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Название проекта *</label>
            <input
              type="text"
              className={`form-input ${errors.projectName ? 'error' : ''}`}
              placeholder="Введите название..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            {errors.projectName && <span className="form-error">{errors.projectName}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Дата начала *</label>
              <input
                type="date"
                className={`form-input ${errors.startDate ? 'error' : ''}`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {errors.startDate && <span className="form-error">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Дата окончания *</label>
              <input
                type="date"
                className={`form-input ${errors.endDate ? 'error' : ''}`}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {errors.endDate && <span className="form-error">{errors.endDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">HC (Headcount) *</label>
            <input
              type="number"
              className={`form-input ${errors.hc ? 'error' : ''}`}
              placeholder="0.1 - 1.0"
              min="0.1"
              max="1.0"
              step="0.1"
              value={hc}
              onChange={(e) => setHc(e.target.value)}
            />
            {errors.hc && <span className="form-error">{errors.hc}</span>}
            <span className="form-hint">От 0.1 (10%) до 1.0 (100% времени)</span>
          </div>

          <div className="form-group">
            <label className="form-label">Цвет</label>
            <div className="color-picker">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  className={`color-option ${color === preset.value ? 'active' : ''}`}
                  style={{ backgroundColor: preset.value }}
                  onClick={() => setColor(preset.value)}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Отмена
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Создать
          </button>
        </div>
      </div>
    </div>
  )
}
