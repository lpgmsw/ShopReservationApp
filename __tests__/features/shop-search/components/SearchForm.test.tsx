import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SearchForm } from '@/features/shop-search/components/SearchForm'
import { searchShops } from '@/features/shop-search/utils/searchShops'

// モック
jest.mock('@/features/shop-search/utils/searchShops', () => ({
  searchShops: jest.fn(),
}))

describe('SearchForm Component', () => {
  const mockOnSearch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('検索フォームが表示される', () => {
    render(<SearchForm onSearch={mockOnSearch} />)

    expect(screen.getByLabelText('店舗名')).toBeInTheDocument()
    expect(screen.getByLabelText('日付')).toBeInTheDocument()
    expect(screen.getByLabelText('時間')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '検索' })).toBeInTheDocument()
  })

  it('店舗名を入力できる', () => {
    render(<SearchForm onSearch={mockOnSearch} />)

    const shopNameInput = screen.getByLabelText('店舗名') as HTMLInputElement
    fireEvent.change(shopNameInput, { target: { value: 'テスト店舗' } })

    expect(shopNameInput.value).toBe('テスト店舗')
  })

  it('日付を入力できる', () => {
    render(<SearchForm onSearch={mockOnSearch} />)

    const dateInput = screen.getByLabelText('日付') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '2025-12-20' } })

    expect(dateInput.value).toBe('2025-12-20')
  })

  it('時間を選択できる', () => {
    render(<SearchForm onSearch={mockOnSearch} />)

    const timeSelect = screen.getByLabelText('時間') as HTMLSelectElement
    fireEvent.change(timeSelect, { target: { value: '10:00' } })

    expect(timeSelect.value).toBe('10:00')
  })

  it('検索ボタンをクリックすると検索が実行される', async () => {
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

    ;(searchShops as jest.Mock).mockResolvedValue({
      success: true,
      data: mockResults,
      total: 1,
      totalPages: 1,
    })

    render(<SearchForm onSearch={mockOnSearch} />)

    const searchButton = screen.getByRole('button', { name: '検索' })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(searchShops).toHaveBeenCalled()
      expect(mockOnSearch).toHaveBeenCalledWith(
        mockResults,
        1,
        1,
        expect.objectContaining({
          shopName: undefined,
          date: undefined,
          time: undefined,
        })
      )
    })
  })

  it('店舗名が文字数上限を超えた場合はエラーが表示される', async () => {
    render(<SearchForm onSearch={mockOnSearch} />)

    const shopNameInput = screen.getByLabelText('店舗名')
    const longName = 'あ'.repeat(101) // 100文字を超える

    fireEvent.change(shopNameInput, { target: { value: longName } })
    fireEvent.click(screen.getByRole('button', { name: '検索' }))

    await waitFor(() => {
      expect(screen.getByText(/店舗名は100文字以下で入力してください/)).toBeInTheDocument()
    })
  })

  // Note: input type="date" では不正な値は自動的にバリデーションされるため、このテストはスキップ

  it('バリデーションエラーが発生しても入力値は維持される', async () => {
    render(<SearchForm onSearch={mockOnSearch} />)

    const shopNameInput = screen.getByLabelText('店舗名') as HTMLInputElement
    const longName = 'あ'.repeat(101)

    fireEvent.change(shopNameInput, { target: { value: longName } })
    fireEvent.click(screen.getByRole('button', { name: '検索' }))

    await waitFor(() => {
      expect(shopNameInput.value).toBe(longName)
    })
  })
})
