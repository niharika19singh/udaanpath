import { useEffect, useRef } from 'react'

/**
 * A soft emerald light that trails the pointer and swells over anything
 * interactive. The native cursor stays visible; this is atmosphere, not a
 * replacement. Only mounted for fine pointers with motion allowed.
 */
function CursorLight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    let x = -200
    let y = -200
    let tx = x
    let ty = y
    let hot = false

    const tick = () => {
      x += (tx - x) * 0.18
      y += (ty - y) * 0.18
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      frame =
        Math.abs(tx - x) + Math.abs(ty - y) > 0.4
          ? requestAnimationFrame(tick)
          : 0
    }
    const onMove = (event: PointerEvent) => {
      tx = event.clientX
      ty = event.clientY
      const target = event.target as Element | null
      const next = Boolean(
        target?.closest('a, button, [data-magnetic], .world'),
      )
      if (next !== hot) {
        hot = next
        el.dataset.hot = hot ? 'true' : 'false'
      }
      el.dataset.visible = 'true'
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const onLeave = () => {
      el.dataset.visible = 'false'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={ref} className="cursor-light" aria-hidden="true">
      <span />
    </div>
  )
}

export default CursorLight
