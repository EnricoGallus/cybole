export default {
    testEnvironment: 'jsDom',
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    moduleNameMapper: {
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy'
    },
    setupFilesAfterEnv: [ '<rootDir>/test/setupTests.ts' ]
}