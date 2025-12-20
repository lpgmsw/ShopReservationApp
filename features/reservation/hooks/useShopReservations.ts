/**
 * useShopReservations Hook
 * Manages shop reservations data with pagination
 */
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchShopReservations } from '@/features/reservation/utils/fetchShopReservations'
import type { ReservationWithUserInfo } from '@/features/reservation/types'

export interface UseShopReservationsReturn {
  reservations: ReservationWithUserInfo[]
  currentPage: number
  totalPages: number
  total: number
  isLoading: boolean
  loadReservations: (shopId: string, page?: number) => Promise<void>
  handlePageChange: (page: number) => Promise<void>
}

export function useShopReservations(): UseShopReservationsReturn {
  const [reservations, setReservations] = useState<ReservationWithUserInfo[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [shopId, setShopId] = useState<string>('')

  const loadReservations = useCallback(async (newShopId: string, page: number = 1) => {
    setIsLoading(true)
    setShopId(newShopId)

    const supabase = createClient()
    const reservationsResult = await fetchShopReservations(supabase, {
      shopId: newShopId,
      page,
      limit: 20,
    })

    if (reservationsResult.success && reservationsResult.data) {
      setReservations(reservationsResult.data)
      setTotal(reservationsResult.total || 0)
      setTotalPages(reservationsResult.totalPages || 1)
      setCurrentPage(page)
    }

    setIsLoading(false)
  }, [])

  const handlePageChange = useCallback(async (page: number) => {
    if (!shopId) return

    setIsLoading(true)
    const supabase = createClient()

    const reservationsResult = await fetchShopReservations(supabase, {
      shopId,
      page,
      limit: 20,
    })

    if (reservationsResult.success && reservationsResult.data) {
      setReservations(reservationsResult.data)
      setTotal(reservationsResult.total || 0)
      setTotalPages(reservationsResult.totalPages || 1)
      setCurrentPage(page)
    }

    setIsLoading(false)
  }, [shopId])

  return {
    reservations,
    currentPage,
    totalPages,
    total,
    isLoading,
    loadReservations,
    handlePageChange,
  }
}
