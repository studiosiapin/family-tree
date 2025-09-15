import React from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';
import { DEFAULT_IMAGES } from '../services/familyTreeService';
import { Couple } from '../types';

export function FamilyTreeDisplay() {
  const { familyData, loading, expandedNodes, toggleNode, openImagePreview } = useFamilyTree();

  if (loading) {
    return (
      <div className="no-data">
        Loading family tree...
      </div>
    );
  }

  if (familyData.couples.length === 0) {
    return (
      <div className="no-data">
        {familyData.people.length === 0 
          ? 'No family data available. Please use the admin panel to add family members.'
          : 'Add some couples to see the family tree here!'
        }
      </div>
    );
  }

  // Find root couples (couples that are not children of other couples)
  const allChildrenIds = new Set<number>();
  familyData.couples.forEach(couple => {
    couple.childrenIds.forEach(childId => allChildrenIds.add(childId));
  });

  const rootCouples = familyData.couples.filter(couple => 
    !allChildrenIds.has(couple.husbandId) && !allChildrenIds.has(couple.wifeId)
  );

  const couplesToShow = rootCouples.length > 0 ? rootCouples : familyData.couples;

  const renderCoupleNode = (couple: Couple): JSX.Element => {
    const husband = familyData.people.find(p => p.id === couple.husbandId);
    const wife = familyData.people.find(p => p.id === couple.wifeId);
    const isExpanded = expandedNodes.has(`couple-${couple.id}`);
    
    if (!husband || !wife) return <div key={couple.id}></div>;

    return (
      <div key={couple.id} className="tree-node">
        <div 
          className="node-card couple-node" 
          onClick={() => toggleNode(`couple-${couple.id}`)}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px' }}>
            <img 
              src={husband.imageUrl || DEFAULT_IMAGES[husband.gender]} 
              alt={husband.name} 
              className="couple-avatar"
              onClick={() => openImagePreview(husband.imageUrl || DEFAULT_IMAGES[husband.gender])}
              style={{ cursor: 'pointer' }}
              title="Click to view larger image"
            />
            <span style={{ margin: '0 4px' }}>💕</span>
            <img 
              src={wife.imageUrl || DEFAULT_IMAGES[wife.gender]} 
              alt={wife.name} 
              className="couple-avatar"
              onClick={() => openImagePreview(wife.imageUrl || DEFAULT_IMAGES[wife.gender])}
              style={{ cursor: 'pointer' }}
              title="Click to view larger image"
            />
          </div>
          <div className="node-name">{husband.name} ♂️ & {wife.name} ♀️</div>
          <div className="node-type">Couple</div>
          {couple.childrenIds.length > 0 && (
            <button className="expand-btn">
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>

        {isExpanded && couple.childrenIds.length > 0 && (
          <>
            <div className="connection-line"></div>
            <div className="children-container">
              {couple.childrenIds.map(childId => {
                const child = familyData.people.find(p => p.id === childId);
                if (!child) return null;

                // Check if this child is part of any couples
                const childCouples = familyData.couples.filter(c => 
                  c.husbandId === childId || c.wifeId === childId
                );
                
                if (childCouples.length > 0) {
                  // This child has their own family, show their couples
                  return childCouples.map(childCouple => renderCoupleNode(childCouple));
                } else {
                  // Single person
                  return (
                    <div key={childId} className="tree-node">
                      <div className="node-card person-node">
                        <img 
                          src={child.imageUrl || DEFAULT_IMAGES[child.gender]} 
                          alt={child.name} 
                          className="node-avatar"
                          onClick={() => openImagePreview(child.imageUrl || DEFAULT_IMAGES[child.gender])}
                          style={{ cursor: 'pointer' }}
                          title="Click to view larger image"
                        />
                        <div className="node-name">{child.name} {child.gender === 'male' ? '♂️' : '♀️'}</div>
                        <div className="node-type">Person</div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="tree-level">
      <div className="couples-row">
        {couplesToShow.map(couple => renderCoupleNode(couple))}
      </div>
    </div>
  );
}