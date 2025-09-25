/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  testTimeout: 180000,
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
}
