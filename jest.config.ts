export default {
    testEnvironment: 'jsDom',
    transform: {
        "^.+\\.(tsx|ts)?$": "ts-jest",
    },
    moduleNameMapper: {
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy'
    },
    setupFilesAfterEnv: [ '<rootDir>/test/setupTests.ts' ]
}