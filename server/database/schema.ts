import { FileStorage } from './fileStorage';

export function initializeDatabase(): FileStorage {
  const storage = new FileStorage();
  console.log('📁 Database initialized (file-based storage)');
  return storage;
}
