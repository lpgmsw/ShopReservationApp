/**
 * Pagination Component
 * Displays previous/next navigation for paginated content
 */
'use client'

import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages

  const handlePrevious = () => {
    if (hasPrevious) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (hasNext) {
      onPageChange(currentPage + 1)
    }
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <Button
        onClick={handlePrevious}
        disabled={!hasPrevious}
        variant="outline"
        className="min-w-[100px]"
      >
        前のページ
      </Button>

      <span className="text-sm text-gray-600">
        {currentPage} / {totalPages} ページ
      </span>

      <Button
        onClick={handleNext}
        disabled={!hasNext}
        variant="outline"
        className="min-w-[100px]"
      >
        次のページ
      </Button>
    </div>
  )
}
