// Mock localStorage for Jest
const localStorageMock = {
  store: {},
  clear() {
    this.store = {};
  },
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  }
};

Object.defineProperty(global.window || global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true
});

// Mock document for Node.js environment
if (typeof document === 'undefined') {
  global.document = {
    addEventListener: jest.fn(),
    createElement: jest.fn(() => ({
      style: {},
      classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
      appendChild: jest.fn(),
      querySelector: jest.fn(() => null),
      querySelectorAll: jest.fn(() => []),
      getElementById: jest.fn(() => null),
      getElementsByClassName: jest.fn(() => []),
      setAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      click: jest.fn()
    }))
  };
}

// Clear localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
});

// Mock showToast function
global.showToast = jest.fn();

// Mock launchConfetti function
global.launchConfetti = jest.fn();

// Mock updateUI function
global.updateUI = jest.fn();
