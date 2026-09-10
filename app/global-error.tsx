"use client"

import { useEffect } from "react"
import posthog from "posthog-js"

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  useEffect(() => {
    posthog.captureException(error)
  }, [error])

  const handleRetry = () => {
    posthog.capture("error_retry_clicked")
    reset()
  }

  return (
    <html lang="en">
      <body>
        <main>
          <h1>Something went wrong</h1>
          <p>We could not load this page. Please try again.</p>
          <button onClick={handleRetry}>Try again</button>
        </main>
      </body>
    </html>
  )
}
