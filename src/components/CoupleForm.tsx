import React, { useState } from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';
import { SearchableSelect } from './SearchableSelect';

export function CoupleForm() {
  const { familyData, createCouple, showMessage } = useFamilyTree();
  const [husbandId, setHusbandId] = useState<number | ''>('');
  const [wifeId, setWifeId] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!husbandId || !wifeId) {
      showMessage('Please select both husband and wife.', 'error');
      return;
    }

    if (husbandId === wifeId) {
      showMessage('Husband and wife cannot be the same person.', 'error');
      return;
    }

    await createCouple(husbandId, wifeId);
    
    // Clear form
    setHusbandId('');
    setWifeId('');
  };

  const males = familyData.people.filter(p => p.gender === 'male');
  const females = familyData.people.filter(p => p.gender === 'female');

  return (
    <div className="section">
      <h2>💑 Create Couple</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="husbandSelect">Husband:</label>
          <SearchableSelect
            items={males}
            displayKey="name"
            valueKey="id"
            selectedValue={husbandId}
            onSelect={(id) => setHusbandId(id ? parseInt(id) : '')}
            placeholder="Search and select husband..."
            renderOption={(person) => (
              <span className="option-name">
                {person.name} ♂️
              </span>
            )}
          />
        </div>
        <div className="form-group">
          <label htmlFor="wifeSelect">Wife:</label>
          <SearchableSelect
            items={females}
            displayKey="name"
            valueKey="id"
            selectedValue={wifeId}
            onSelect={(id) => setWifeId(id ? parseInt(id) : '')}
            placeholder="Search and select wife..."
            renderOption={(person) => (
              <span className="option-name">
                {person.name} ♀️
              </span>
            )}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          💕 Create Couple
        </button>
      </form>
    </div>
  );
}