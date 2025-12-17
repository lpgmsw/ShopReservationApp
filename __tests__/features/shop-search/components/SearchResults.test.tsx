import { render, screen, fireEvent } from '@testing-library/react'
import { SearchResults } from '@/features/shop-search/components/SearchResults'

describe('SearchResults Component', () => {
  const mockOnPageChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('検索結果が0件の場合はメッセージを表示', () => {
    render(
      <SearchResults
        results={[]}
        currentPage={1}
        totalPages={0}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByText('検索に当てはまる店舗がありません。')).toBeInTheDocument()
  })

  it('検索結果が表示される', () => {
    const mockResults = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗1',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '09:00',
        reservation_hours_end: '17:00',
      },
      {
        id: 'shop-2',
        shop_name: 'テスト店舗2',
        business_hours_start: '10:00',
        business_hours_end: '19:00',
        reservation_hours_start: '10:00',
        reservation_hours_end: '18:00',
      },
    ]

    render(
      <SearchResults
        results={mockResults}
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByText('テスト店舗1')).toBeInTheDocument()
    expect(screen.getByText('テスト店舗2')).toBeInTheDocument()
    expect(screen.getByText(/営業時間: 09:00 - 18:00/)).toBeInTheDocument()
    expect(screen.getByText(/営業時間: 10:00 - 19:00/)).toBeInTheDocument()
  })

  it('予約受付時間が表示される', () => {
    const mockResults = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '09:00',
        reservation_hours_end: '17:00',
      },
    ]

    render(
      <SearchResults
        results={mockResults}
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByText(/予約受付時間: 09:00 - 17:00/)).toBeInTheDocument()
  })

  it('予約ボタンが表示される', () => {
    const mockResults = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '09:00',
        reservation_hours_end: '17:00',
      },
    ]

    render(
      <SearchResults
        results={mockResults}
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByRole('button', { name: '予約' })).toBeInTheDocument()
  })

  it('予約キャンセルボタンが表示される', () => {
    const mockResults = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '09:00',
        reservation_hours_end: '17:00',
      },
    ]

    render(
      <SearchResults
        results={mockResults}
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByRole('button', { name: '予約キャンセル' })).toBeInTheDocument()
  })

  it('ページネーションが2ページ以上の場合に表示される', () => {
    const mockResults = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '09:00',
        reservation_hours_end: '17:00',
      },
    ]

    render(
      <SearchResults
        results={mockResults}
        currentPage={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByRole('button', { name: '次へ' })).toBeInTheDocument()
  })

  it('ページネーションの次へボタンをクリックするとページが変わる', () => {
    const mockResults = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '09:00',
        reservation_hours_end: '17:00',
      },
    ]

    render(
      <SearchResults
        results={mockResults}
        currentPage={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    )

    const nextButton = screen.getByRole('button', { name: '次へ' })
    fireEvent.click(nextButton)

    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('最終ページでは次へボタンが無効化される', () => {
    const mockResults = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '09:00',
        reservation_hours_end: '17:00',
      },
    ]

    render(
      <SearchResults
        results={mockResults}
        currentPage={3}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    )

    const nextButton = screen.getByRole('button', { name: '次へ' })
    expect(nextButton).toBeDisabled()
  })

  it('最初のページでは前へボタンが無効化される', () => {
    const mockResults = [
      {
        id: 'shop-1',
        shop_name: 'テスト店舗',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '09:00',
        reservation_hours_end: '17:00',
      },
    ]

    render(
      <SearchResults
        results={mockResults}
        currentPage={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    )

    const prevButton = screen.getByRole('button', { name: '前へ' })
    expect(prevButton).toBeDisabled()
  })
})
