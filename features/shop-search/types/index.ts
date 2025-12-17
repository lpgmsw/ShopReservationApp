// Shop型定義
export interface Shop {
  id: string
  owner_id: string
  shop_name: string
  business_hours_start: string
  business_hours_end: string
  reservation_hours_start: string
  reservation_hours_end: string
  business_days: string[]
  closed_days: string[]
  created_at: string
  updated_at: string
}

// 検索パラメータ
export interface SearchParams {
  shopName?: string
  date?: string
  time?: string
  page: number
  limit: number
}

// 検索結果
export interface SearchResult {
  success: boolean
  data?: Shop[]
  total?: number
  totalPages?: number
  error?: string
}
