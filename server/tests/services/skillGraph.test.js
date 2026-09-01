const SkillGraphService = require('../../services/skillGraph.service');
const Skill = require('../../models/Skill');

jest.mock('../../models/Skill');

describe('Skill Dependency Graph Service', () => {
    describe('Prerequisites & Dependents', () => {
        it('should retrieve correct prerequisites for core domain skills', async () => {
            const siemPrereqs = await SkillGraphService.getPrerequisites('siem');
            expect(siemPrereqs).toContain('networking');
            expect(siemPrereqs).toContain('linux');

            const reactPrereqs = await SkillGraphService.getPrerequisites('react');
            expect(reactPrereqs).toContain('javascript');
        });

        it('should identify dependent skills requiring a prerequisite', async () => {
            const linuxDependents = await SkillGraphService.getDependents('linux');
            expect(linuxDependents.map(d => d.toLowerCase())).toContain('siem');
            expect(linuxDependents.map(d => d.toLowerCase())).toContain('docker');
        });
    });

    describe('Prerequisite Evaluation & Blocker Detection', () => {
        it('should block dependent skills if prerequisites have low mastery (< 70%)', async () => {
            const mockMasteryMap = new Map();
            mockMasteryMap.set('networking', { masteryScore: 35, level: 'Beginner' });
            mockMasteryMap.set('linux', { masteryScore: 45, level: 'Developing' });

            const result = await SkillGraphService.evaluateSkillPrerequisites(
                'user123',
                'siem',
                mockMasteryMap
            );

            expect(result.isBlocked).toBe(true);
            expect(result.missingPrerequisites.length).toBe(2);
            expect(result.reason).toContain('Blocked by prerequisite gaps');
        });

        it('should unlock dependent skills once all prerequisites achieve >= 70% mastery', async () => {
            const mockMasteryMap = new Map();
            mockMasteryMap.set('networking', { masteryScore: 82, level: 'Proficient' });
            mockMasteryMap.set('linux', { masteryScore: 74, level: 'Proficient' });

            const result = await SkillGraphService.evaluateSkillPrerequisites(
                'user123',
                'siem',
                mockMasteryMap
            );

            expect(result.isBlocked).toBe(false);
            expect(result.missingPrerequisites.length).toBe(0);
            expect(result.reason).toBe('All prerequisites satisfied');
        });
    });

    describe('Circular Dependency Prevention', () => {
        it('should detect direct and indirect cycles in proposed dependencies', () => {
            // A -> B -> C -> A (Cycle!)
            const graph = new Map();
            graph.set('a', ['b']);
            graph.set('b', ['c']);
            
            const hasCycle = SkillGraphService.hasCircularDependency('c', ['a'], graph);
            expect(hasCycle).toBe(true);
        });

        it('should allow valid acyclic DAG dependencies', () => {
            // A -> B -> C (Acyclic)
            const graph = new Map();
            graph.set('a', []);
            graph.set('b', ['a']);
            
            const hasCycle = SkillGraphService.hasCircularDependency('c', ['b'], graph);
            expect(hasCycle).toBe(false);
        });
    });
});
