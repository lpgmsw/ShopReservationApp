'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/user/Header'
import { Footer } from '@/components/user/Footer'
import { Sidebar } from '@/components/user/Sidebar'
import { SearchForm } from '@/features/shop-search/components/SearchForm'
import { SearchResults } from '@/features/shop-search/components/SearchResults'
import type { Shop } from '@/features/shop-search/types'

export default function MyPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<Shop[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [lastSearchParams, setLastSearchParams] = useState<{
    shopName?: string
    date?: string
    time?: string
  }>({})

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()

      // 認証チェック
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/user/login')
        return
      }

      // ユーザー名取得
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_name')
        .eq('id', user.id)
        .single()

      if (userError || !userData) {
        console.error('Failed to fetch user data:', userError)
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
    searchParams?: { shopName?: string; date?: string; time?: string }
  ) => {
    setSearchResults(results)
    setCurrentPage(page)
    setTotalPages(total)
    if (searchParams) {
      setLastSearchParams(searchParams)
    }
  }

  const handlePageChange = async (newPage: number) => {
    const { searchShops } = await import('@/features/shop-search/utils/searchShops')
    const result = await searchShops({
      shopName: lastSearchParams.shopName,
      date: lastSearchParams.date,
      time: lastSearchParams.time,
      page: newPage,
      limit: 20,
    })

    if (result.success && result.data) {
      setSearchResults(result.data)
      setCurrentPage(newPage)
      setTotalPages(result.totalPages || 0)
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={userName} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            店舗検索
          </h1>

          <SearchForm onSearch={handleSearch} />

          <SearchResults
            results={searchResults}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </main>
      </div>

      <Footer />
    </div>
  )
}
