/**
 * useSuccessMessage Hook
 * Manages success message display from URL search parameters
 */
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { z } from 'zod'

const successMessageSchema = z.enum(['registered', 'updated'])

export type SuccessMessageType = 'registered' | 'updated'

export interface UseSuccessMessageReturn {
  showSuccessMessage: boolean
  successMessageType: SuccessMessageType | null
}

export function useSuccessMessage(): UseSuccessMessageReturn {
  const searchParams = useSearchParams()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessageType, setSuccessMessageType] = useState<SuccessMessageType | null>(null)

  useEffect(() => {
    const successParam = searchParams.get('success')

    // Validate with Zod
    const validationResult = successMessageSchema.safeParse(successParam)

    if (validationResult.success) {
      setSuccessMessageType(validationResult.data)
      setShowSuccessMessage(true)

      // Hide message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
        setSuccessMessageType(null)
      }, 3000)
    }
  }, [searchParams])

  return { showSuccessMessage, successMessageType }
}
