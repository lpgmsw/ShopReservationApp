'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/system-admin/Header'
import { Footer } from '@/components/system-admin/Footer'
import { AdminSearchForm } from '@/features/shop-search/components/AdminSearchForm'
import { AdminShopList } from '@/features/shop-search/components/AdminShopList'
import type { Shop } from '@/features/shop-search/types'

function SystemAdminShopsContent() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<Shop[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [lastSearchParams, setLastSearchParams] = useState<{
    shopName?: string
    businessHoursStart?: string
    businessHoursEnd?: string
    businessDays?: string[]
    closedDays?: string[]
  }>({})

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()

      // 認証チェック
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/system-admin/login')
        return
      }

      // ユーザー名とロール取得
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_name, role')
        .eq('id', user.id)
        .single()

      if (userError || !userData) {
        console.error('Failed to fetch user data:', userError)
        router.push('/system-admin/login')
        return
      }

      // システム管理者チェック
      if (userData.role !== 'system_admin') {
        console.warn('Access denied: User is not a system admin')
        router.push('/user/login')
        return
      }

      setUserName(userData.user_name)
      setIsLoading(false)
    }

    init()
  }, [router])

  const handleSearch = (
    results: Shop[],
    page: number,
    total: number,
    searchParams?: {
      shopName?: string
      businessHoursStart?: string
      businessHoursEnd?: string
      businessDays?: string[]
      closedDays?: string[]
    }
  ) => {
    setSearchResults(results)
    setCurrentPage(page)
    setTotalPages(total)
    if (searchParams) {
      setLastSearchParams(searchParams)
    }
  }

  const handlePageChange = async (newPage: number) => {
    const { searchShopsForAdmin } = await import('@/features/shop-search/utils/searchShopsForAdmin')
    const result = await searchShopsForAdmin({
      shopName: lastSearchParams.shopName,
      businessHoursStart: lastSearchParams.businessHoursStart,
      businessHoursEnd: lastSearchParams.businessHoursEnd,
      businessDays: lastSearchParams.businessDays,
      closedDays: lastSearchParams.closedDays,
      page: newPage,
      limit: 20,
    })

    if (result.success && result.data) {
      setSearchResults(result.data)
      setCurrentPage(newPage)
      setTotalPages(result.totalPages || 0)
    }
  }

  const handleShopDeleted = async () => {
    // 削除後、現在のページで再検索
    const { searchShopsForAdmin } = await import('@/features/shop-search/utils/searchShopsForAdmin')
    const result = await searchShopsForAdmin({
      shopName: lastSearchParams.shopName,
      businessHoursStart: lastSearchParams.businessHoursStart,
      businessHoursEnd: lastSearchParams.businessHoursEnd,
      businessDays: lastSearchParams.businessDays,
      closedDays: lastSearchParams.closedDays,
      page: currentPage,
      limit: 20,
    })

    if (result.success && result.data) {
      setSearchResults(result.data)
      setTotalPages(result.totalPages || 0)

      // 現在のページに結果がなく、前のページがある場合は前のページに戻る
      if (result.data.length === 0 && currentPage > 1) {
        handlePageChange(currentPage - 1)
      }
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={userName} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          店舗一覧
        </h1>

        <AdminSearchForm onSearch={handleSearch} />

        <AdminShopList
          results={searchResults}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onShopDeleted={handleShopDeleted}
        />
      </main>

      <Footer />
    </div>
  )
}

export default function SystemAdminShopsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <SystemAdminShopsContent />
    </Suspense>
  )
}
