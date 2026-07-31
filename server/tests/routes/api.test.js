const express = require('express');
const request = require('supertest');
const authRoutes = require('../../routes/auth');
const profileRoutes = require('../../routes/profile');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User');
jest.mock('../../models/Profile');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

process.env.JWT_SECRET = 'test_secret';

describe('API Route Integration Tests', () => {

    describe('Auth Routes', () => {
        it('POST /api/auth/login should return 400 for invalid credentials', async () => {
            User.findOne.mockResolvedValue(null);
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'wrong@test.com', password: 'password123' });
            
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'Invalid credentials' });
        });

        it('POST /api/auth/login should return 200 and token on success', async () => {
            const mockUser = {
                id: '123',
                email: 'right@test.com',
                matchPassword: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'right@test.com', password: 'password123' });
            
            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();
        });
    });

    describe('Profile Routes', () => {
        it('GET /api/profile/me should return 401 without auth token', async () => {
            const res = await request(app).get('/api/profile/me');
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Not authorized, no token');
        });

        it('GET /api/profile/me should return 200 with valid token', async () => {
            const token = jwt.sign({ id: '123' }, process.env.JWT_SECRET);
            
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue({ id: '123', email: 'test@test.com' })
            });
            Profile.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ user: '123', general: { firstName: 'Test' } })
            });

            const res = await request(app)
                .get('/api/profile/me')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.status).toBe(200);
            expect(res.body.general.firstName).toBe('Test');
        });
    });
});
