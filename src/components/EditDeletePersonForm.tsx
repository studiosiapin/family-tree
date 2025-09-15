import React, { useState, useEffect } from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';
import { Person } from '../types';
import { SearchableSelect } from './SearchableSelect';

export function EditDeletePersonForm() {
  const { familyData, updatePerson, deletePerson, showMessage } = useFamilyTree();
  const [selectedPersonId, setSelectedPersonId] = useState<number | ''>('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (selectedPersonId) {
      const person = familyData.people.find(p => p.id === selectedPersonId);
      if (person) {
        setSelectedPerson(person);
        setName(person.name);
        setGender(person.gender);
        setImageFile(null);
      }
    } else {
      setSelectedPerson(null);
      setName('');
      setGender('');
      setImageFile(null);
    }
  }, [selectedPersonId, familyData.people]);

  const handlePersonSelect = (personId: string) => {
    setSelectedPersonId(personId ? parseInt(personId) : '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPersonId || !name.trim() || !gender) {
      showMessage('Please fill in all required fields.', 'error');
      return;
    }

    await updatePerson(selectedPersonId, name.trim(), gender, imageFile || undefined);
    
    // Reset file input
    const fileInput = document.getElementById('editPersonImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setImageFile(null);
  };

  const handleClearImage = async () => {
    if (!selectedPersonId) return;
    
    await updatePerson(selectedPersonId, name, gender, undefined, true);
    
    // Reset file input
    const fileInput = document.getElementById('editPersonImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setImageFile(null);
  };

  const handleDelete = async () => {
    if (!selectedPersonId || !selectedPerson) {
      showMessage('Please select a person to delete.', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedPerson.name}? This will also remove them from any couples and relationships. This cannot be undone.`)) {
      return;
    }

    await deletePerson(selectedPersonId);
    
    // Clear form
    setSelectedPersonId('');
    setSelectedPerson(null);
    setName('');
    setGender('');
    setImageFile(null);
  };

  return (
    <div className="section">
      <h2>✏️ Edit/Delete Person</h2>
      <div className="form-group">
        <label>Search and Select Person to Edit:</label>
        <SearchableSelect
          items={familyData.people}
          displayKey="name"
          valueKey="id"
          selectedValue={selectedPersonId}
          onSelect={handlePersonSelect}
          placeholder="Type to search for a person..."
          renderOption={(person) => (
            <span className="option-name">
              {person.name} {person.gender === 'male' ? '♂️' : '♀️'}
            </span>
          )}
        />
      </div>
      
      {selectedPerson && (
        <div>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label htmlFor="editPersonName">Name:</label>
              <input
                type="text"
                id="editPersonName"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="editPersonGender">Gender:</label>
              <select
                id="editPersonGender"
                className="form-control"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male ♂️</option>
                <option value="female">Female ♀️</option>
              </select>
            </div>
            <div className="form-group">
              <label>Current Profile Picture:</label>
              <div style={{ marginBottom: '10px' }}>
                {selectedPerson.imageUrl ? (
                  <img
                    src={selectedPerson.imageUrl}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #e2e8f0'
                    }}
                    alt="Current profile"
                  />
                ) : (
                  <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                    No image set
                  </div>
                )}
              </div>
              <label htmlFor="editPersonImage">Change Profile Picture (optional):</label>
              <input
                type="file"
                id="editPersonImage"
                className="form-control"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="btn btn-secondary"
                style={{ marginTop: '8px' }}
              >
                🗑️ Clear Image
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                ✏️ Update Person
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
              >
                🗑️ Delete Person
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}