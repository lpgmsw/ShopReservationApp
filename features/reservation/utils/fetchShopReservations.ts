/**
 * Fetch shop reservations with user information
 * Used by shop admin to view all reservations for their shop
 */
import { z } from 'zod'
import type { ReservationWithUserInfo } from '@/features/reservation/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Zod schemas for input validation
const shopIdSchema = z.string().uuid('不正な店舗IDです')
const pageSchema = z.number().int().min(1, 'ページ番号は1以上である必要があります')
const limitSchema = z.number().int().min(1).max(100, '1ページあたりの件数は1〜100の範囲である必要があります')

export interface FetchShopReservationsParams {
  shopId: string
  page?: number
  limit?: number
}

export interface FetchShopReservationsResult {
  success: boolean
  data?: ReservationWithUserInfo[]
  total?: number
  totalPages?: number
  currentPage?: number
  error?: string
}

/**
 * Fetch reservations for a specific shop with user information (with pagination)
 * @param supabase - Supabase client instance
 * @param params - Parameters including shopId, page, and limit
 * @returns Result object with reservations data, pagination info, or error
 */
export async function fetchShopReservations(
  supabase: SupabaseClient,
  params: FetchShopReservationsParams
): Promise<FetchShopReservationsResult> {
  const { shopId, page = 1, limit = 20 } = params

  // Input validation with Zod
  const shopIdValidation = shopIdSchema.safeParse(shopId)
  if (!shopIdValidation.success) {
    return {
      success: false,
      error: shopIdValidation.error.errors[0].message,
    }
  }

  const pageValidation = pageSchema.safeParse(page)
  if (!pageValidation.success) {
    return {
      success: false,
      error: pageValidation.error.errors[0].message,
    }
  }

  const limitValidation = limitSchema.safeParse(limit)
  if (!limitValidation.success) {
    return {
      success: false,
      error: limitValidation.error.errors[0].message,
    }
  }

  try {
    const validatedShopId = shopIdValidation.data
    const validatedPage = pageValidation.data
    const validatedLimit = limitValidation.data
    const offset = (validatedPage - 1) * validatedLimit

    // Query from shops table to get reservations (this respects RLS policies)
    // We need to start from shops table because RLS policy may be set on shops.owner_id
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select(`
        id,
        max_reservations_per_slot,
        reservations (
          id,
          user_id,
          shop_id,
          reservation_date,
          reservation_time,
          reserver_name,
          comment,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('id', validatedShopId)
      .single()

    if (shopError) {
      console.error('Database error fetching shop:', shopError)
      return {
        success: false,
        error: '予約一覧の取得に失敗しました',
      }
    }

    if (!shopData || !shopData.reservations) {
      return {
        success: true,
        data: [],
        total: 0,
        totalPages: 0,
        currentPage: validatedPage,
      }
    }

    // Sort reservations by date and time
    const sortedReservations = shopData.reservations.sort((a, b) => {
      const dateCompare = a.reservation_date.localeCompare(b.reservation_date)
      if (dateCompare !== 0) return dateCompare
      return a.reservation_time.localeCompare(b.reservation_time)
    })

    const totalCount = sortedReservations.length
    const totalPages = Math.ceil(totalCount / validatedLimit)

    // Apply pagination
    const paginatedReservations = sortedReservations.slice(offset, offset + validatedLimit)

    // If no reservations in this page, return empty array
    if (paginatedReservations.length === 0) {
      return {
        success: true,
        data: [],
        total: totalCount,
        totalPages,
        currentPage: validatedPage,
      }
    }

    // Get unique user IDs
    const userIds = [...new Set(paginatedReservations.map(r => r.user_id))]

    // Fetch user names from public.users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, user_name')
      .in('id', userIds)

    if (usersError) {
      console.error('Database error fetching users:', usersError)
      return {
        success: false,
        error: '予約一覧の取得に失敗しました',
      }
    }

    // Create a map of user_id to user_name
    const userMap = new Map(usersData?.map(u => [u.id, u.user_name]) || [])

    // Create a map to count reservations per time slot
    // Key: "date_time", Value: count of active reservations
    const slotCountMap = new Map<string, number>()
    sortedReservations
      .filter(r => r.status === 'active')
      .forEach((reservation) => {
        const slotKey = `${reservation.reservation_date}_${reservation.reservation_time}`
        slotCountMap.set(slotKey, (slotCountMap.get(slotKey) || 0) + 1)
      })

    // Combine reservations with user names and slot count info
    const maxReservationsPerSlot = shopData.max_reservations_per_slot || 1
    const reservations: ReservationWithUserInfo[] = paginatedReservations.map((reservation) => {
      const slotKey = `${reservation.reservation_date}_${reservation.reservation_time}`
      const slotCount = reservation.status === 'active' ? slotCountMap.get(slotKey) || 0 : 0

      return {
        id: reservation.id,
        user_id: reservation.user_id,
        shop_id: reservation.shop_id,
        reservation_date: reservation.reservation_date,
        reservation_time: reservation.reservation_time,
        reserver_name: reservation.reserver_name,
        comment: reservation.comment,
        status: reservation.status,
        created_at: reservation.created_at,
        updated_at: reservation.updated_at,
        user_name: userMap.get(reservation.user_id) || '',
        slot_count: slotCount,
        slot_max: maxReservationsPerSlot,
      }
    })

    return {
      success: true,
      data: reservations,
      total: totalCount,
      totalPages,
      currentPage: validatedPage,
    }
  } catch (error) {
    console.error('Unexpected error fetching reservations:', error)
    return {
      success: false,
      error: '予約一覧の取得に失敗しました',
    }
  }
}
