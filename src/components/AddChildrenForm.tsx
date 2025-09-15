import React, { useState } from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';

export function AddChildrenForm() {
  const { familyData, addChildren, showMessage } = useFamilyTree();
  const [coupleId, setCoupleId] = useState<number | ''>('');
  const [selectedChildren, setSelectedChildren] = useState<number[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coupleId) {
      showMessage('Please select a couple.', 'error');
      return;
    }

    if (selectedChildren.length === 0) {
      showMessage('Please select at least one child.', 'error');
      return;
    }

    await addChildren(coupleId, selectedChildren);
    
    // Clear form
    setCoupleId('');
    setSelectedChildren([]);
  };

  const handleChildToggle = (childId: number) => {
    setSelectedChildren(prev => 
      prev.includes(childId) 
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  // Get all children who already have parents
  const childrenWithParents = new Set<number>();
  familyData.couples.forEach(couple => {
    couple.childrenIds.forEach(childId => {
      childrenWithParents.add(childId);
    });
  });

  // Only show people who don't already have parents
  const availableChildren = familyData.people.filter(person => 
    !childrenWithParents.has(person.id)
  );

  return (
    <div className="section">
      <h2>👶 Add Children to Couple</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="coupleSelect">Select Couple:</label>
          <select
            id="coupleSelect"
            className="form-control"
            value={coupleId}
            onChange={(e) => setCoupleId(e.target.value ? parseInt(e.target.value) : '')}
            required
          >
            <option value="">Select Couple</option>
            {familyData.couples.map(couple => {
              const husband = familyData.people.find(p => p.id === couple.husbandId);
              const wife = familyData.people.find(p => p.id === couple.wifeId);
              return (
                <option key={couple.id} value={couple.id}>
                  {husband?.name} & {wife?.name}
                </option>
              );
            })}
          </select>
        </div>
        <div className="form-group">
          <label>Select Children:</label>
          <div className="multi-select">
            {availableChildren.length > 0 ? (
              availableChildren.map(person => (
                <label key={person.id}>
                  <input
                    type="checkbox"
                    value={person.id}
                    checked={selectedChildren.includes(person.id)}
                    onChange={() => handleChildToggle(person.id)}
                  />
                  {person.name} {person.gender === 'male' ? '♂️' : '♀️'}
                </label>
              ))
            ) : (
              <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                No available children (all people already have parents)
              </div>
            )}
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          👶 Add Children
        </button>
      </form>
    </div>
  );
}