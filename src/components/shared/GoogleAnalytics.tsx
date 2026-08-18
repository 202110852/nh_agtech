import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const GA_MEASUREMENT_ID = 'G-SSPGPSKCPP'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function GoogleAnalytics() {
  const location = useLocation()

  useEffect(() => {
    if (typeof window.gtag !== 'function') return

    const pagePath = `${location.pathname}${location.search}`
    window.gtag('event', 'page_view', {
      send_to: GA_MEASUREMENT_ID,
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [location.pathname, location.search])

  return null
}
