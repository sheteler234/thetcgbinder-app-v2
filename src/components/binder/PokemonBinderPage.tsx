import React from 'react';
import { motion } from 'framer-motion';
import type { Product } from '../../lib/types';
import PokemonBinderGrid from './PokemonBinderGrid';

interface PokemonBinderPageProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PokemonBinderPage: React.FC<PokemonBinderPageProps> = ({
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
      {/* Binder Container - Now handled entirely by PokemonBinderGrid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl mx-auto"
      >
        <PokemonBinderGrid
          products={products}
          externalCurrentPage={Math.max(0, currentPage - 1)} // Convert from 1-based to 0-based
          externalTotalPages={totalPages}
          onPageChange={handlePageChangeWithDirection}
        />
      </motion.div>
    </div>
  );
};

export default PokemonBinderPage;
