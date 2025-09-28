import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Кастомный хук для определения мобильного устройства
 * Отслеживает изменения размера экрана и возвращает true для мобильных устройств
 * @returns boolean - true если экран меньше 768px (мобильное устройство)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
