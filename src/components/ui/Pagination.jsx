'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
}) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate smart page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="p-4 bg-white border-t border-[#CED2E3]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      {/* Items Count Indicator */}
      <div className="text-[#6D6E70]">
        Menampilkan <span className="font-semibold text-[#171F3F]">{startItem}</span> -{' '}
        <span className="font-semibold text-[#171F3F]">{endItem}</span> dari{' '}
        <span className="font-semibold text-[#171F3F]">{totalItems}</span> data
      </div>

      {/* Navigation Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#CED2E3] text-[#171F3F] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span key={`dots-${idx}`} className="px-2 text-[#6D6E70]">
                  &hellip;
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                    currentPage === page
                      ? 'bg-[#171F3F] text-white shadow-2xs'
                      : 'text-[#6D6E70] hover:text-[#171F3F] hover:bg-[#F5F6FA]'
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#CED2E3] text-[#171F3F] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
