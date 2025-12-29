import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SystemAdminShopEditForm } from '@/features/shop/components/SystemAdminShopEditForm'
import { fetchShopById } from '@/features/shop/utils/fetchShopById'
import { updateShop } from '@/features/shop/utils/updateShop'
import { useRouter } from 'next/navigation'

jest.mock('@/features/shop/utils/fetchShopById')
jest.mock('@/features/shop/utils/updateShop')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('SystemAdminShopEditForm Component', () => {
  const mockPush = jest.fn()
  const mockShopData = {
    id: 'shop-123',
    shop_name: 'テスト店舗',
    business_hours_start: '09:00',
    business_hours_end: '18:00',
    reservation_hours_start: '10:00',
    reservation_hours_end: '17:00',
    business_days: ['月', '火', '水', '木', '金'],
    closed_days: ['土', '日'],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(fetchShopById as jest.Mock).mockResolvedValue({
      success: true,
      data: mockShopData,
    })
  })

  it('店舗情報を読み込んでフォームに表示する', async () => {
    render(<SystemAdminShopEditForm shopId="shop-123" />)

    await waitFor(() => {
      expect(fetchShopById).toHaveBeenCalledWith('shop-123')
    })

    await waitFor(() => {
      const shopNameInput = screen.getByLabelText('店舗名') as HTMLInputElement
      expect(shopNameInput.value).toBe('テスト店舗')
    })
  })

  it('店舗情報の取得に失敗した場合、エラーメッセージを表示する', async () => {
    ;(fetchShopById as jest.Mock).mockResolvedValue({
      success: false,
      error: '店舗情報の取得に失敗しました',
    })

    render(<SystemAdminShopEditForm shopId="shop-123" />)

    await waitFor(() => {
      expect(screen.getByText('店舗情報の取得に失敗しました')).toBeInTheDocument()
    })
  })

  it('更新ボタンをクリックすると確認モーダルが表示される', async () => {
    render(<SystemAdminShopEditForm shopId="shop-123" />)

    await waitFor(() => {
      const shopNameInput = screen.getByLabelText('店舗名') as HTMLInputElement
      expect(shopNameInput.value).toBe('テスト店舗')
    })

    const updateButton = screen.getByRole('button', { name: '更新' })
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(screen.getByText('更新しますか？')).toBeInTheDocument()
    })
  })

  it('モーダルで更新を確定すると、店舗情報が更新される', async () => {
    ;(updateShop as jest.Mock).mockResolvedValue({ success: true })

    render(<SystemAdminShopEditForm shopId="shop-123" />)

    await waitFor(() => {
      const shopNameInput = screen.getByLabelText('店舗名') as HTMLInputElement
      expect(shopNameInput.value).toBe('テスト店舗')
    })

    // 更新ボタンをクリック
    const updateButton = screen.getByRole('button', { name: '更新' })
    fireEvent.click(updateButton)

    // モーダルで更新を確定
    await waitFor(() => {
      expect(screen.getByText('更新しますか？')).toBeInTheDocument()
    })

    const updateButtons = screen.getAllByRole('button', { name: '更新' })
    const confirmButton = updateButtons[1] // モーダル内の更新ボタン
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(updateShop).toHaveBeenCalledWith('shop-123', {
        shop_name: 'テスト店舗',
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        reservation_hours_start: '10:00',
        reservation_hours_end: '17:00',
        business_days: ['月', '火', '水', '木', '金'],
        closed_days: ['土', '日'],
      })
      expect(mockPush).toHaveBeenCalledWith('/system-admin/shops?success=updated')
    })
  })

  it('モーダルでキャンセルすると、モーダルが閉じる', async () => {
    render(<SystemAdminShopEditForm shopId="shop-123" />)

    await waitFor(() => {
      const shopNameInput = screen.getByLabelText('店舗名') as HTMLInputElement
      expect(shopNameInput.value).toBe('テスト店舗')
    })

    // 更新ボタンをクリック
    const updateButton = screen.getByRole('button', { name: '更新' })
    fireEvent.click(updateButton)

    // モーダルが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('更新しますか？')).toBeInTheDocument()
    })

    // モーダルでキャンセル
    const cancelButton = screen.getAllByRole('button', { name: 'キャンセル' })[1] // モーダル内のキャンセルボタン
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('更新しますか？')).not.toBeInTheDocument()
    })

    expect(updateShop).not.toHaveBeenCalled()
  })

  it('キャンセルボタンをクリックすると、マイページに戻る', async () => {
    render(<SystemAdminShopEditForm shopId="shop-123" />)

    await waitFor(() => {
      const shopNameInput = screen.getByLabelText('店舗名') as HTMLInputElement
      expect(shopNameInput.value).toBe('テスト店舗')
    })

    const cancelButton = screen.getAllByRole('button', { name: 'キャンセル' })[0] // フォーム内のキャンセルボタン
    fireEvent.click(cancelButton)

    expect(mockPush).toHaveBeenCalledWith('/system-admin/shops')
  })
})
