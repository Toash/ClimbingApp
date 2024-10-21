module.exports = {
    testEnvironment: 'node',
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },
};