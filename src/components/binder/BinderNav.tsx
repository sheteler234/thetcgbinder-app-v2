import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface BinderNavProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const BinderNav: React.FC<BinderNavProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevPage = () => {
    if (canGoPrev && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNext && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;
      
      if (e.key === 'ArrowLeft' && canGoPrev) {
        handlePrevPage();
      } else if (e.key === 'ArrowRight' && canGoNext) {
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, isLoading]);

  return (
    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-lg">
      {/* Previous Page Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={handlePrevPage}
        disabled={!canGoPrev || isLoading}
        className="flex items-center space-x-2 min-w-[120px]"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Previous</span>
      </Button>

      {/* Page Info */}
      <div className="flex items-center space-x-4">
        {/* Page dots */}
        <div className="flex items-center space-x-2">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
            let pageNumber;
            
            if (totalPages <= 5) {
              pageNumber = index + 1;
            } else if (currentPage <= 3) {
              pageNumber = index + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + index;
            } else {
              pageNumber = currentPage - 2 + index;
            }

            const isActive = pageNumber === currentPage;
            
            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-red-500 scale-125'
                    : 'bg-slate-600 hover:bg-slate-500'
                } ${isLoading ? 'opacity-50' : ''}`}
                aria-label={`Go to page ${pageNumber}`}
              />
            );
          })}
        </div>

        {/* Page text */}
        <div className="text-center">
          <div className="text-slate-300 text-sm">
            Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
            <span className="font-semibold text-white">{totalPages}</span>
          </div>
        </div>
      </div>

      {/* Next Page Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={handleNextPage}
        disabled={!canGoNext || isLoading}
        className="flex items-center space-x-2 min-w-[120px]"
      >
        <span>Next</span>
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default BinderNav;
