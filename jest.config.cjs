module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  moduleFileExtensions: ["js", "jsx", "json"],
  testMatch: ["<rootDir>/src/**/*.test.[jt]s?(x)"],
  clearMocks: true
};
