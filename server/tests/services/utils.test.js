const JobMatchService = require('../../services/jobMatch.service');
const emailService = require('../../utils/emailService');
const nodemailer = require('nodemailer');

jest.mock('nodemailer');
jest.mock('../../models/Course');

describe('Utility & Service Tests', () => {

    describe('JobMatchService', () => {
        it('should return 30 if job has no required skills', () => {
            const user = {};
            const job = { requiredSkills: [] };
            const score = JobMatchService.calculateScore(user, job, new Set(), new Set());
            expect(score).toBe(30);
        });

        it('should calculate accurate score with exact matches', () => {
            const user = { learningGoals: { focus: 'developer' } };
            const job = { title: 'Software Developer', requiredSkills: ['javascript', 'react'] };
            const expandedSkillsSet = new Set(['javascript', 'react', 'node']);
            const userSkillsSet = new Set(['javascript', 'react']); // 100% exact match

            const score = JobMatchService.calculateScore(user, job, expandedSkillsSet, userSkillsSet);
            
            // exactScore = 50, goalScore = 20, demandScore = 5 (default)
            expect(score).toBe(75);
        });

        it('should detect missing skills accurately', () => {
            const job = { requiredSkills: ['React', 'Node', 'Docker'] };
            const userSkillsSet = new Set(['react', 'javascript']);
            
            const missing = JobMatchService.detectMissingSkills(job, userSkillsSet);
            expect(missing).toEqual(['Node', 'Docker']);
        });
    });

    describe('emailService', () => {
        it('should send email with correct configuration', async () => {
            const mockSendMail = jest.fn().mockResolvedValue(true);
            nodemailer.createTransport.mockReturnValue({
                sendMail: mockSendMail
            });
            nodemailer.createTestAccount.mockResolvedValue({
                user: 'testUser',
                pass: 'testPass'
            });

            await emailService({
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'Test Message'
            });

            expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test Message'
            }));
        });
    });
});
