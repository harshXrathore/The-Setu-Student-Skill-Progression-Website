// tests/setup.js
// Setup file to configure global mocks or environment for Jest tests
require('dotenv').config();

// Mock Mongoose connect and disconnect globally
jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        connect: jest.fn().mockResolvedValue(true),
        connection: {
            close: jest.fn().mockResolvedValue(true),
            on: jest.fn(),
            once: jest.fn()
        }
    };
});
