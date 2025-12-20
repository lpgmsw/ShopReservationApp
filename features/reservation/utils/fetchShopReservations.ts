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
 * Database response type for reservations with joined users
 */
interface ReservationDbRow {
  id: string
  user_id: string
  shop_id: string
  reservation_date: string
  reservation_time: string
  reserver_name: string
  comment: string
  status: 'active' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
  users: {
    user_name: string
  }
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

    // Fetch total count for pagination
    const { count, error: countError } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', validatedShopId)

    if (countError) {
      console.error('Database error fetching count:', countError)
      return {
        success: false,
        error: '予約一覧の取得に失敗しました',
      }
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / validatedLimit)

    // Fetch reservations with user information joined
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        user_id,
        shop_id,
        reservation_date,
        reservation_time,
        reserver_name,
        comment,
        status,
        created_at,
        updated_at,
        users!inner(user_name)
      `)
      .eq('shop_id', validatedShopId)
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true })
      .range(offset, offset + validatedLimit - 1)

    if (error) {
      console.error('Database error fetching reservations:', error)
      return {
        success: false,
        error: '予約一覧の取得に失敗しました',
      }
    }

    // Transform the nested users object to flat structure with proper typing
    const reservations: ReservationWithUserInfo[] = (data as ReservationDbRow[] || []).map((item) => ({
      id: item.id,
      user_id: item.user_id,
      shop_id: item.shop_id,
      reservation_date: item.reservation_date,
      reservation_time: item.reservation_time,
      reserver_name: item.reserver_name,
      comment: item.comment,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user_name: item.users.user_name,
    }))

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
