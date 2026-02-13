import { useState, useCallback } from 'react'
import type { DragState } from './types'

export function useDragSelection(isDayOccupied: (propertyId: string, day: number) => boolean) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragState, setDragState] = useState<DragState | null>(null)

  const handleMouseDown = (propertyId: string, day: number) => {
    if (isDayOccupied(propertyId, day)) return
    setIsDragging(true)
    setDragState({ propertyId, startDay: day, endDay: day })
  }

  const handleMouseEnter = useCallback(
    (propertyId: string, day: number) => {
      if (!isDragging || !dragState) return
      if (propertyId !== dragState.propertyId) return

      const minDay = Math.min(dragState.startDay, day)
      const maxDay = Math.max(dragState.startDay, day)

      let hasConflict = false
      for (let d = minDay; d <= maxDay; d++) {
        if (isDayOccupied(propertyId, d)) {
          hasConflict = true
          break
        }
      }

      if (!hasConflict) {
        setDragState({ ...dragState, endDay: day })
      }
    },
    [isDragging, dragState, isDayOccupied],
  )

  /** Finalizes drag. Returns normalized selection or null. */
  const handleMouseUp = () => {
    if (isDragging && dragState) {
      const start = Math.min(dragState.startDay, dragState.endDay)
      const end = Math.max(dragState.startDay, dragState.endDay)
      setDragState({ ...dragState, startDay: start, endDay: end })
      setIsDragging(false)
      return { propertyId: dragState.propertyId, startDay: start, endDay: end }
    }
    setIsDragging(false)
    return null
  }

  const showSelectionPreview = useCallback(
    (propertyId: string, day: number) => {
      if (!dragState || dragState.propertyId !== propertyId) return false
      const start = Math.min(dragState.startDay, dragState.endDay)
      const end = Math.max(dragState.startDay, dragState.endDay)
      return day >= start && day <= end
    },
    [dragState],
  )

  const resetDrag = useCallback(() => {
    setDragState(null)
    setIsDragging(false)
  }, [])

  return {
    dragState,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    showSelectionPreview,
    resetDrag,
  }
}
