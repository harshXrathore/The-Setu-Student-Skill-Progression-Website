const { loginUser, signupStep1 } = require('../../controllers/authController');
const User = require('../../models/User');
const sendEmail = require('../../utils/emailService');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User');
jest.mock('../../utils/emailService');
jest.mock('../../services/gamification.service', () => ({
    triggerMilestone: jest.fn()
}));

// Mock process.env
process.env.JWT_SECRET = 'test_secret';

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    describe('loginUser', () => {
        it('should return 400 if user does not exist', async () => {
            req.body = { email: 'test@test.com', password: 'password123' };
            User.findOne.mockResolvedValue(null);

            await loginUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
        });

        it('should return a JWT token on successful login', async () => {
            req.body = { email: 'test@test.com', password: 'Valid1!' };
            const mockUser = {
                id: '123',
                name: 'Test',
                email: 'test@test.com',
                role: 'student',
                matchPassword: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(mockUser);

            await loginUser(req, res);

            expect(mockUser.matchPassword).toHaveBeenCalledWith('Valid1!');
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                _id: '123',
                token: expect.any(String)
            }));
        });
    });

    describe('signupStep1', () => {
        it('should require name and email', async () => {
            req.body = { name: 'Test' };
            await signupStep1(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Please provide name and email' });
        });

        it('should create an unverified user and send an OTP via email', async () => {
            req.body = { name: 'New User', email: 'new@test.com' };
            User.findOne.mockResolvedValue(null);
            
            const mockSave = jest.fn().mockResolvedValue(true);
            User.create.mockResolvedValue({
                email: 'new@test.com',
                save: mockSave
            });
            sendEmail.mockResolvedValue(true);

            await signupStep1(req, res);

            expect(User.create).toHaveBeenCalled();
            expect(mockSave).toHaveBeenCalled();
            expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
                email: 'new@test.com',
                subject: 'Verify your Email Address'
            }));
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
