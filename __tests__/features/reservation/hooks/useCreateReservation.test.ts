import { renderHook, act, waitFor } from '@testing-library/react'
import { useCreateReservation } from '@/features/reservation/hooks/useCreateReservation'
import { createReservation } from '@/features/reservation/utils/createReservation'
import type { ReservationFormInput } from '@/features/reservation/types'

jest.mock('@/features/reservation/utils/createReservation')

const mockCreateReservation = createReservation as jest.MockedFunction<
  typeof createReservation
>

describe('useCreateReservation', () => {
  const userId = 'user-123'
  const shopId = 'shop-456'
  const formData: ReservationFormInput = {
    reservationDate: '2025-12-25',
    reservationTime: '14:30',
    reserverName: 'テストユーザー',
    comment: 'よろしくお願いします',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useCreateReservation())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.create).toBe('function')
  })

  it('should successfully create a reservation', async () => {
    mockCreateReservation.mockResolvedValue({
      success: true,
    })

    const { result } = renderHook(() => useCreateReservation())

    let createResult: { success: boolean; error?: string } | undefined

    await act(async () => {
      createResult = await result.current.create(userId, shopId, formData)
    })

    expect(createResult).toEqual({ success: true })
    expect(mockCreateReservation).toHaveBeenCalledWith(userId, shopId, formData)
    expect(result.current.error).toBeNull()
  })

  it('should set loading state during creation', async () => {
    mockCreateReservation.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100)
        )
    )

    const { result } = renderHook(() => useCreateReservation())

    expect(result.current.isLoading).toBe(false)

    let createPromise: Promise<any>
    act(() => {
      createPromise = result.current.create(userId, shopId, formData)
    })

    // Should be loading immediately after calling create
    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      await createPromise
    })

    // Should not be loading after completion
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle creation failure with error message', async () => {
    mockCreateReservation.mockResolvedValue({
      success: false,
      error: 'この日時は既に予約済みです',
    })

    const { result } = renderHook(() => useCreateReservation())

    let createResult: { success: boolean; error?: string } | undefined

    await act(async () => {
      createResult = await result.current.create(userId, shopId, formData)
    })

    expect(createResult).toEqual({
      success: false,
      error: 'この日時は既に予約済みです',
    })
    expect(result.current.error).toBe('この日時は既に予約済みです')
  })

  it('should handle duplicate reservation error', async () => {
    mockCreateReservation.mockResolvedValue({
      success: false,
      error: 'この日時は既に予約済みです',
    })

    const { result } = renderHook(() => useCreateReservation())

    await act(async () => {
      await result.current.create(userId, shopId, formData)
    })

    expect(result.current.error).toBe('この日時は既に予約済みです')
  })

  it('should handle generic database error', async () => {
    mockCreateReservation.mockResolvedValue({
      success: false,
      error: '予約の作成に失敗しました',
    })

    const { result } = renderHook(() => useCreateReservation())

    await act(async () => {
      await result.current.create(userId, shopId, formData)
    })

    expect(result.current.error).toBe('予約の作成に失敗しました')
  })

  it('should clear error on successful creation after previous failure', async () => {
    const { result } = renderHook(() => useCreateReservation())

    // First call fails
    mockCreateReservation.mockResolvedValueOnce({
      success: false,
      error: '予約の作成に失敗しました',
    })

    await act(async () => {
      await result.current.create(userId, shopId, formData)
    })

    expect(result.current.error).toBe('予約の作成に失敗しました')

    // Second call succeeds
    mockCreateReservation.mockResolvedValueOnce({
      success: true,
    })

    await act(async () => {
      await result.current.create(userId, shopId, formData)
    })

    expect(result.current.error).toBeNull()
  })

  it('should allow multiple consecutive calls', async () => {
    mockCreateReservation.mockResolvedValue({
      success: true,
    })

    const { result } = renderHook(() => useCreateReservation())

    await act(async () => {
      await result.current.create(userId, shopId, formData)
    })

    await act(async () => {
      await result.current.create(userId, 'shop-789', formData)
    })

    expect(mockCreateReservation).toHaveBeenCalledTimes(2)
    expect(mockCreateReservation).toHaveBeenNthCalledWith(1, userId, shopId, formData)
    expect(mockCreateReservation).toHaveBeenNthCalledWith(
      2,
      userId,
      'shop-789',
      formData
    )
  })

  it('should handle exception thrown by createReservation', async () => {
    mockCreateReservation.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useCreateReservation())

    let createResult: { success: boolean; error?: string } | undefined

    await act(async () => {
      createResult = await result.current.create(userId, shopId, formData)
    })

    expect(createResult).toEqual({
      success: false,
      error: '予約の作成に失敗しました',
    })
    expect(result.current.error).toBe('予約の作成に失敗しました')
  })

  it('should not be loading after error', async () => {
    mockCreateReservation.mockResolvedValue({
      success: false,
      error: '予約の作成に失敗しました',
    })

    const { result } = renderHook(() => useCreateReservation())

    await act(async () => {
      await result.current.create(userId, shopId, formData)
    })

    expect(result.current.isLoading).toBe(false)
  })
})
