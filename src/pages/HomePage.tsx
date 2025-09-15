import React from 'react';
import { FamilyTreeDisplay } from '../components/FamilyTreeDisplay';
import { ImagePreviewModal } from '../components/ImagePreviewModal';
import { useFamilyTree } from '../context/FamilyTreeContext';

export function HomePage() {
  const { imagePreviewUrl, closeImagePreview } = useFamilyTree();

  return (
    <div className="container">
      {/* Header */}
      <div className="customer-header">
        <h1 className="customer-title">🌳 Our Family Tree</h1>
        <p className="customer-subtitle">Explore our family connections and relationships</p>
      </div>

      {/* Tree View */}
      <div className="tree-container">
        <div className="tree-view">
          <FamilyTreeDisplay />
        </div>
      </div>

      {/* Image Preview Modal */}
      {imagePreviewUrl && (
        <ImagePreviewModal
          imageUrl={imagePreviewUrl}
          onClose={closeImagePreview}
        />
      )}
    </div>
  );
}