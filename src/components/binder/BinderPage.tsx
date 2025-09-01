import React from 'react';
import { motion } from 'framer-motion';
import type { Product } from '../../lib/types';
import BinderGrid from './BinderGrid';

interface BinderPageProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const BinderPage: React.FC<BinderPageProps> = ({
  products,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePageChangeWithDirection = (page: number) => {
    onPageChange(page + 1); // Convert from 0-based to 1-based
  };

  return (
    <div className="w-full">
      {/* Binder Container - Now handled entirely by BinderGrid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl mx-auto"
      >
        <BinderGrid
          products={products}
          externalCurrentPage={currentPage - 1}
          onPageChange={handlePageChangeWithDirection}
          externalTotalPages={totalPages}
        />
      </motion.div>
    </div>
  );
};

export default BinderPage;
