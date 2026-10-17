import { useEffect, useState, type RefObject } from 'react'

/**
 * 0 → 1 progress of an element scrolling through the viewport. Writes a
 * `--progress` custom property on the element every frame it changes so CSS
 * can drive transforms without React re-rendering, and returns a coarse
 * value (rounded to `steps`) for logic that needs it.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  {
    mode = 'through',
    steps = 100,
  }: { mode?: 'through' | 'reading'; steps?: number } = {},
) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    let last = -1

    const measure = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      // "reading": how far down the element a line just below mid-screen has
      //   reached, so a growing line can track the reader's eye.
      // "through": progress from entering the bottom to the centre of the view.
      const raw =
        mode === 'reading'
          ? (vh * 0.62 - rect.top) / Math.max(1, rect.height)
          : (vh - rect.top) / (vh * 0.5 + rect.height * 0.5)
      const p = Math.min(1, Math.max(0, raw))
      el.style.setProperty('--progress', p.toFixed(4))
      const coarse = Math.round(p * steps) / steps
      if (coarse !== last) {
        last = coarse
        setValue(coarse)
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [ref, mode, steps])

  return value
}

/** Adds `is-in` once an element is meaningfully on screen (and keeps it). */
export function useReveal(
  ref: RefObject<HTMLElement | null>,
  threshold = 0.25,
) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, shown, threshold])
  return shown
}

/** True while the element is on screen; used to pause ambient loops. */
export function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return visible
}
