const { getCurrentProfile, createOrUpdateProfile, getProfileByUserId } = require('../../controllers/profileController');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const gamification = require('../../services/gamification.service');

jest.mock('../../models/Profile');
jest.mock('../../models/User');
jest.mock('../../services/gamification.service', () => ({
    triggerMilestone: jest.fn().mockResolvedValue(true)
}));

describe('Profile Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { user: { id: 'user123' }, body: {}, params: {} };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
    });

    describe('getCurrentProfile', () => {
        it('should return 404 if profile does not exist', async () => {
            Profile.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await getCurrentProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'There is no profile for this user' });
        });

        it('should return profile if exists', async () => {
            const mockProfile = { user: 'user123', general: { firstName: 'Test' } };
            Profile.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockProfile)
            });

            await getCurrentProfile(req, res);

            expect(res.json).toHaveBeenCalledWith(mockProfile);
        });
    });

    describe('createOrUpdateProfile', () => {
        it('should create new profile if one does not exist', async () => {
            req.body = { general: { firstName: 'New' } };
            Profile.findOne.mockResolvedValue(null);
            
            const mockSave = jest.fn().mockResolvedValue(true);
            Profile.mockImplementation(() => ({
                save: mockSave
            }));

            await createOrUpdateProfile(req, res);

            expect(Profile).toHaveBeenCalledWith(expect.objectContaining({ general: { firstName: 'New' } }));
            expect(res.json).toHaveBeenCalled();
        });

        it('should update existing profile and trigger milestone if complete', async () => {
            req.body = { general: { firstName: 'Updated' }, occupation: { role: 'Dev' }, skills: ['JS'] };
            const existingProfile = { _id: 'prof1' };
            Profile.findOne.mockResolvedValue(existingProfile);
            
            const updatedProfile = { 
                general: { firstName: 'Updated' }, 
                occupation: { role: 'Dev' }, 
                skills: ['JS'] 
            };
            Profile.findOneAndUpdate.mockResolvedValue(updatedProfile);

            await createOrUpdateProfile(req, res);

            expect(Profile.findOneAndUpdate).toHaveBeenCalled();
            expect(gamification.triggerMilestone).toHaveBeenCalledWith('user123', 'Profile Completed');
            expect(res.json).toHaveBeenCalledWith(updatedProfile);
        });
    });
});
