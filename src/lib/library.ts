
export type LibraryItemPayload = any;

export type LibraryItem = {
  id: string;
  type: string; // e.g., 'Summary', 'Flashcards', 'Question Bank'
  title: string;
  timestamp: string;
  payload: LibraryItemPayload;
};

export const getLibraryItems = (): LibraryItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const items = localStorage.getItem('synapse-library');
  return items ? JSON.parse(items) : [];
};

export const saveLibraryItem = (item: Omit<LibraryItem, 'id' | 'timestamp'>) => {
  if (typeof window === 'undefined') return;
  const items = getLibraryItems();
  const newItem: LibraryItem = {
    ...item,
    id: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  };
  const newItems = [newItem, ...items];
  localStorage.setItem('synapse-library', JSON.stringify(newItems));
};
