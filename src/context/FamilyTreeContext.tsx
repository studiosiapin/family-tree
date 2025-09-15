import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Person, Couple, Message } from '../types';
import { 
  getPeople,
  getCouples,
  addPerson as addPersonService,
  updatePerson as updatePersonService,
  deletePerson as deletePersonService,
  addCouple as addCoupleService,
  updateCoupleChildren as updateCoupleChildrenService,
  resetData as resetDataService
} from '../services/familyTreeService';

interface FamilyData {
  people: Person[];
  couples: Couple[];
}

interface FamilyTreeContextType {
  familyData: FamilyData;
  loading: boolean;
  expandedNodes: Set<string>;
  message: Message | null;
  imagePreviewUrl: string | null;
  addPerson: (name: string, gender: 'male' | 'female', imageFile?: File) => Promise<void>;
  updatePerson: (id: number, name: string, gender: 'male' | 'female', imageFile?: File, clearImage?: boolean) => Promise<void>;
  deletePerson: (id: number | string) => Promise<void>;
  createCouple: (husbandId: number | string, wifeId: number | string) => Promise<void>;
  addChildren: (coupleId: number | string, childrenIds: (number | string)[]) => Promise<void>;
  resetData: () => void;
  toggleNode: (nodeId: string) => void;
  showMessage: (text: string, type: 'success' | 'error') => void;
  clearMessage: () => void;
  refreshData: () => void;
  openImagePreview: (url: string) => void;
  closeImagePreview: () => void;
}

const FamilyTreeContext = createContext<FamilyTreeContextType | undefined>(undefined);

export function useFamilyTree() {
  const context = useContext(FamilyTreeContext);
  if (context === undefined) {
    throw new Error('useFamilyTree must be used within a FamilyTreeProvider');
  }
  return context;
}

interface FamilyTreeProviderProps {
  children: ReactNode;
}

export function FamilyTreeProvider({ children }: FamilyTreeProviderProps) {
  const [familyData, setFamilyData] = useState<FamilyData>({ people: [], couples: [] });
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<Message | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [people, couples] = await Promise.all([getPeople(), getCouples()]);
      setFamilyData({ people, couples });
    } catch (error) {
      console.error('Error loading family data:', error);
      showMessage('Error loading family data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
  };

  const clearMessage = () => {
    setMessage(null);
  };

  const addPerson = async (name: string, gender: 'male' | 'female', imageFile?: File) => {
    try {
      const person = await addPersonService(name, gender, imageFile);
      await refreshData();
      showMessage(`Added ${person.name} to the family tree.`, 'success');
    } catch (error) {
      console.error('Error adding person:', error);
      showMessage(`Error adding person: ${error instanceof Error ? error.message : 'Please try again.'}`, 'error');
    }
  };

  const updatePerson = async (id: number | string, name: string, gender: 'male' | 'female', imageFile?: File, clearImage?: boolean) => {
    try {
      const person = await updatePersonService(id, name, gender, imageFile, clearImage);
      await refreshData();
      showMessage(`Updated ${person.name} successfully.`, 'success');
    } catch (error) {
      console.error('Error updating person:', error);
      showMessage(`Error updating person: ${error instanceof Error ? error.message : 'Please try again.'}`, 'error');
    }
  };

  const deletePerson = async (id: number | string) => {
    try {
      const person = familyData.people.find(p => p.id === id);
      if (!person) {
        throw new Error('Person not found');
      }
      
      deletePersonService(id);
      await refreshData();
      showMessage(`Deleted ${person.name} and removed from all relationships.`, 'success');
    } catch (error) {
      console.error('Error deleting person:', error);
      showMessage(`Error deleting person: ${error instanceof Error ? error.message : 'Please try again.'}`, 'error');
    }
  };

  const createCouple = async (husbandId: number | string, wifeId: number | string) => {
    try {
      const couple = await addCoupleService(husbandId, wifeId);
      await refreshData();
      
      // Auto-expand the newly created couple
      setExpandedNodes(prev => new Set(prev).add(`couple-${couple.id}`));
      
      const husband = familyData.people.find(p => p.id === husbandId);
      const wife = familyData.people.find(p => p.id === wifeId);
      showMessage(`Created couple: ${husband?.name} & ${wife?.name}`, 'success');
    } catch (error) {
      console.error('Error creating couple:', error);
      showMessage(`Error creating couple: ${error instanceof Error ? error.message : 'Please try again.'}`, 'error');
    }
  };

  const addChildren = async (coupleId: number | string, childrenIds: (number | string)[]) => {
    try {
      await updateCoupleChildrenService(coupleId, childrenIds);
      await refreshData();
      
      // Auto-expand the couple to show the newly added children
      setExpandedNodes(prev => new Set(prev).add(`couple-${coupleId}`));
      
      const couple = familyData.couples.find(c => c.id === coupleId);
      const husband = familyData.people.find(p => p.id === couple?.husbandId);
      const wife = familyData.people.find(p => p.id === couple?.wifeId);
      const childNames = childrenIds.map(id => {
        const child = familyData.people.find(p => p.id === id);
        return child ? child.name : 'Unknown';
      }).join(', ');
      
      showMessage(`Added children (${childNames}) to ${husband?.name} & ${wife?.name}`, 'success');
    } catch (error) {
      console.error('Error adding children:', error);
      showMessage(`Error adding children: ${error instanceof Error ? error.message : 'Please try again.'}`, 'error');
    }
  };

  const resetData = async () => {
    try {
      await resetDataService();
      await refreshData();
      setExpandedNodes(new Set());
      showMessage('All data has been cleared.', 'success');
    } catch (error) {
      console.error('Error resetting data:', error);
      showMessage(`Error clearing data: ${error instanceof Error ? error.message : 'Please try again.'}`, 'error');
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const openImagePreview = (url: string) => {
    setImagePreviewUrl(url);
  };

  const closeImagePreview = () => {
    setImagePreviewUrl(null);
  };

  return (
    <FamilyTreeContext.Provider
      value={{
        familyData,
        loading,
        expandedNodes,
        message,
        imagePreviewUrl,
        addPerson,
        updatePerson,
        deletePerson,
        createCouple,
        addChildren,
        resetData,
        toggleNode,
        showMessage,
        clearMessage,
        refreshData,
        openImagePreview,
        closeImagePreview
      }}
    >
      {children}
    </FamilyTreeContext.Provider>
  );
}