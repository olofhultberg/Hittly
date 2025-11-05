// Mock expo-sqlite (kommer att installeras senare)
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    withTransaction: jest.fn((callback) => callback()),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
    runSync: jest.fn(() => ({ lastInsertRowId: 1, changes: 1 })),
  })),
}), { virtual: true });

// Mock expo-file-system (kommer att installeras senare)
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://mock-document-directory/',
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: false })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
}), { virtual: true });

// Mock expo-image-picker (kommer att installeras senare)
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

