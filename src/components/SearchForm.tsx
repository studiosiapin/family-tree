import React, { useState } from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';

export function SearchForm() {
  const { familyData, showMessage, toggleNode } = useFamilyTree();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      showMessage('Please enter a search term.', 'error');
      return;
    }

    // Remove previous highlights
    document.querySelectorAll('.node-card').forEach(node => {
      node.classList.remove('highlighted');
    });

    const matchingPeople = familyData.people.filter(person => 
      person.name.toLowerCase().includes(term)
    );

    if (matchingPeople.length === 0) {
      showMessage(`No person found with name containing "${term}".`, 'error');
      return;
    }

    // Expand all nodes to show matches
    familyData.couples.forEach(couple => {
      toggleNode(`couple-${couple.id}`);
    });

    // Highlight matches after a short delay to allow for re-rendering
    setTimeout(() => {
      matchingPeople.forEach(person => {
        const nodeCards = document.querySelectorAll('.node-card');
        nodeCards.forEach(card => {
          if (card.textContent?.includes(person.name)) {
            card.classList.add('highlighted');
          }
        });
      });

      showMessage(`Found ${matchingPeople.length} person(s) matching "${term}".`, 'success');
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="section">
      <h2>🔍 Search</h2>
      <form onSubmit={handleSubmit}>
        <div className="search-container">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>
    </div>
  );
}