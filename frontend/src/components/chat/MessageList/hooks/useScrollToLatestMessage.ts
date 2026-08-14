import { useEffect, useRef, type RefObject } from 'react'

export const useScrollToLatestMessage = (signature: string): RefObject<HTMLDivElement | null> => {
  const anchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const anchor = anchorRef.current

    if (anchor && typeof anchor.scrollIntoView === 'function') {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [signature])

  return anchorRef
}
