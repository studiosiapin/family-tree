import React, { useState } from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';

export function PersonForm() {
  const { addPerson } = useFamilyTree();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !gender) {
      return;
    }

    await addPerson(name.trim(), gender, imageFile || undefined);
    
    // Clear form
    setName('');
    setGender('');
    setImageFile(null);
    // Reset file input
    const fileInput = document.getElementById('personImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="section">
      <h2>👤 Add Person</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="personName">Name:</label>
          <input
            type="text"
            id="personName"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="personGender">Gender:</label>
          <select
            id="personGender"
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
          <label htmlFor="personImage">Profile Picture (optional):</label>
          <input
            type="file"
            id="personImage"
            className="form-control"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          ➕ Add Person
        </button>
      </form>
    </div>
  );
}