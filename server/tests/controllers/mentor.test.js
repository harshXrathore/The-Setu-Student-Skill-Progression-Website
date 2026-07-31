const { getAllMentors, updateSessionStatus } = require('../../controllers/mentorController');
const Profile = require('../../models/Profile');
const Session = require('../../models/Session');
const Notification = require('../../models/Notification');

jest.mock('../../models/Profile');
jest.mock('../../models/Session');
jest.mock('../../models/Notification');
jest.mock('../../services/gamification.service', () => ({
    addPoints: jest.fn(),
    logActivity: jest.fn(),
    triggerMilestone: jest.fn()
}));

describe('Mentor Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { user: { id: 'user123' }, body: {}, params: {} };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
    });

    describe('getAllMentors', () => {
        it('should return verified mentors only', async () => {
            const mockProfiles = [
                { user: { name: 'Verified Mentor', isVerifiedMentor: true } },
                { user: null } // Unverified mentor
            ];
            
            Profile.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockProfiles)
            });

            await getAllMentors(req, res);

            expect(res.json).toHaveBeenCalledWith([mockProfiles[0]]);
        });
    });

    describe('updateSessionStatus', () => {
        it('should return 404 if session not found', async () => {
            req.params.id = 'sess1';
            Session.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await updateSessionStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Session not found' });
        });

        it('should allow mentor to accept session and send notification', async () => {
            req.params.id = 'sess1';
            req.body = { status: 'Confirmed', meetingUrl: 'http://meet' };
            req.user = { id: 'mentor123' };

            const mockSession = {
                _id: 'sess1',
                mentor: { _id: 'mentor123', name: 'Mentor Name' },
                student: 'student123',
                date: new Date(),
                status: 'Pending',
                save: jest.fn().mockResolvedValue(true)
            };

            Session.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockSession)
            });
            
            Notification.create.mockResolvedValue(true);

            await updateSessionStatus(req, res);

            expect(mockSession.status).toBe('Confirmed');
            expect(mockSession.meetingUrl).toBe('http://meet');
            expect(mockSession.save).toHaveBeenCalled();
            expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({
                recipient: 'student123'
            }));
        });
        
        it('should return 403 if user is neither mentor nor student of the session', async () => {
            req.params.id = 'sess1';
            req.body = { status: 'Confirmed' };
            req.user = { id: 'hacker123' }; // Not authorized

            const mockSession = {
                _id: 'sess1',
                mentor: { _id: 'mentor123', name: 'Mentor Name' },
                student: 'student123'
            };

            Session.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockSession)
            });

            await updateSessionStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to update this session' });
        });
    });
});
