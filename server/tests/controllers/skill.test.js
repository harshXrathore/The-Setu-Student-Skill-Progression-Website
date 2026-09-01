const { analyzeProfile } = require('../../controllers/skillController');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Roadmap = require('../../models/Roadmap');
const RoleGuide = require('../../models/RoleGuide');

const mockGenerateContent = jest.fn();
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: () => ({
            generateContent: mockGenerateContent
        })
    }))
}));
jest.mock('../../models/Roadmap');
jest.mock('../../models/RoleGuide');
jest.mock('../../models/Course');
jest.mock('../../services/mistakeAnalysis.service');

// Mock process.env
process.env.GEMINI_API_KEY = 'test_key';

describe('Skill Controller (AI Roadmap)', () => {
    let req, res;

    beforeEach(() => {
        req = { 
            body: { 
                occupation: { jobTitle: 'Developer' }
            },
            user: { id: 'user123' }
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        
        Roadmap.create.mockImplementation(data => Promise.resolve(data));
        mockGenerateContent.mockClear();
    });

    it('should return existing roadmap if found and regenerate is false', async () => {
        const mockRoadmap = { goal: 'Developer', user: 'user123' };
        Roadmap.findOne.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockRoadmap)
        });

        await analyzeProfile(req, res);

        expect(Roadmap.findOne).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(mockRoadmap);
    });

    it('should generate a new roadmap via Gemini and save it', async () => {
        Roadmap.findOne.mockReturnValue({
            sort: jest.fn().mockResolvedValue(null) // No existing roadmap
        });
        RoleGuide.findOne.mockReturnValue({
            sort: jest.fn().mockResolvedValue(null)
        });

        const mockAIResponse = {
            response: {
                text: () => JSON.stringify({
                    roadmapPhases: [
                        { phase: "Phase 1", duration: "1 month", skills: [{ name: "HTML" }] },
                        { phase: "Phase 2", duration: "2 months", skills: [{ name: "CSS" }] },
                        { phase: "Phase 3", duration: "3 months", skills: [{ name: "JS" }] }
                    ],
                    analysis: "Test Analysis"
                })
            }
        };
        mockGenerateContent.mockResolvedValue(mockAIResponse);
        Roadmap.prototype.save = jest.fn().mockResolvedValue(true);

        await analyzeProfile(req, res);

        expect(mockGenerateContent).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            goal: 'Developer',
            roadmapPhases: expect.any(Array)
        }));
    });

    it('should use resilient fallback roadmap if AI generation fails', async () => {
        Roadmap.findOne.mockReturnValue({
            sort: jest.fn().mockResolvedValue(null)
        });
        RoleGuide.findOne.mockReturnValue({
            sort: jest.fn().mockResolvedValue(null)
        });

        mockGenerateContent.mockRejectedValue(new Error('AI API Error'));
        Roadmap.prototype.save = jest.fn().mockResolvedValue(true);

        await analyzeProfile(req, res);

        expect(mockGenerateContent).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            goal: 'Developer',
            roadmapPhases: expect.any(Array)
        }));
    });

    it('should return 500 if GEMINI_API_KEY is missing', async () => {
        const originalKey = process.env.GEMINI_API_KEY;
        delete process.env.GEMINI_API_KEY;

        await analyzeProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Server misconfiguration: AI key missing.'
        }));

        process.env.GEMINI_API_KEY = originalKey;
    });
});
