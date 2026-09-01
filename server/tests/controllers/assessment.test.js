const assessmentService = require('../../services/assessment.service');
const { getAssessmentBySkill, submitAssessment, getAssessmentHistory } = require('../../controllers/assessmentController');

jest.mock('../../services/assessment.service');

describe('Assessment Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
            body: {},
            user: { id: 'user123' }
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('getAssessmentBySkill', () => {
        it('should return sanitized questions without exposing correctAnswer', async () => {
            req.params.skillName = 'JavaScript';
            
            assessmentService.getOrGenerateAssessment.mockResolvedValue({
                _id: 'assess123',
                title: 'JavaScript Assessment',
                skill: 'JavaScript',
                difficulty: 'intermediate',
                questions: [
                    {
                        questionId: 'js-1',
                        question: 'What is NaN?',
                        options: ['Number', 'String'],
                        correctAnswer: 'Number',
                        topic: 'Types',
                        difficulty: 'easy'
                    }
                ]
            });

            await getAssessmentBySkill(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                _id: 'assess123',
                title: 'JavaScript Assessment',
                questions: expect.arrayContaining([
                    expect.objectContaining({
                        questionId: 'js-1',
                        question: 'What is NaN?',
                        options: ['Number', 'String']
                    })
                ])
            }));

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.questions[0].correctAnswer).toBeUndefined();
        });

        it('should return 400 if skillName is missing', async () => {
            req.params.skillName = '';
            await getAssessmentBySkill(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('submitAssessment', () => {
        it('should grade attempt and return submission result', async () => {
            req.params.id = 'assess123';
            req.body = {
                answers: [
                    { questionId: 'js-1', selectedOption: 'Number' }
                ],
                timeSpentSeconds: 45
            };

            const mockResult = {
                attempt: { _id: 'att123', score: 100 },
                isPassed: true,
                score: 100,
                correctCount: 1,
                totalQuestions: 1,
                mistakesLoggedCount: 0,
                updatedMastery: { masteryScore: 85, level: 'Mastered' }
            };

            assessmentService.submitAttempt.mockResolvedValue(mockResult);

            await submitAssessment(req, res);

            expect(assessmentService.submitAttempt).toHaveBeenCalledWith(
                'user123',
                'assess123',
                req.body.answers,
                45
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should return 400 if answers is not an array', async () => {
            req.params.id = 'assess123';
            req.body = { answers: 'invalid' };

            await submitAssessment(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
