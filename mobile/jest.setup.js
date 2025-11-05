// Mock expo-sqlite med förbättrad mockning
const mockDb = {
  data: new Map(),
  lastInsertRowId: 0,
  execSync: jest.fn((sql) => {
    // Enkel SQL-parsing för CREATE TABLE
    if (sql.includes('CREATE TABLE IF NOT EXISTS')) {
      // Tabeller skapas automatiskt
      return;
    }
  }),
  withTransaction: jest.fn((callback) => callback()),
  getAllSync: jest.fn((sql, params = []) => {
    // Mock-implementation för getAllSync
    return [];
  }),
  getFirstSync: jest.fn((sql, params = []) => {
    // Mock-implementation för getFirstSync
    return null;
  }),
  runSync: jest.fn((sql, params = []) => {
    mockDb.lastInsertRowId++;
    return { lastInsertRowId: mockDb.lastInsertRowId, changes: 1 };
  }),
  closeSync: jest.fn(),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => mockDb),
}), { virtual: true });

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://mock-document-directory/',
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: false })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
}), { virtual: true });

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      cancelled: false,
      assets: [{ uri: 'file://mock-image.jpg', width: 100, height: 100 }],
    })
  ),
  MediaTypeOptions: {
    Images: 'Images',
  },
}), { virtual: true });

// Mock expo-crypto
jest.mock('expo-crypto', () => {
  const crypto = require('crypto');
  return {
    digestStringAsync: jest.fn((algorithm, data) => {
      return Promise.resolve(crypto.createHash('sha256').update(data).digest('hex'));
    }),
    CryptoDigestAlgorithm: {
      SHA256: 'SHA256',
    },
  };
}, { virtual: true });

// Reset mock-databasen mellan tester
beforeEach(() => {
  mockDb.data.clear();
  mockDb.lastInsertRowId = 0;
  mockDb.getFirstSync.mockReturnValue(null);
  mockDb.getAllSync.mockReturnValue([]);
});
