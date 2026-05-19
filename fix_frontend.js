const fs = require('fs');
let content = fs.readFileSync('src/app/components/feature-pages.tsx', 'utf8');

// 1. Replace Interface
content = content.replace(/interface CareerPath\s*\{[^}]+}/, 'import { CareerPath } from "../types/career";');

// 2. Add Sort state
content = content.replace(/const \[selectedDemand, setSelectedDemand\] = useState\(""\);/, 'const [selectedDemand, setSelectedDemand] = useState("");\n  const [sortBy, setSortBy] = useState<"match" | "salary" | "demand" | "none">("none");');

// 3. Dynamic demandLevels
content = content.replace(/const demandLevels = \["High", "Very High", "Medium", "Low"\];/, 'const demandLevels = useMemo(() => { return Array.from(new Set(careerPaths.map(c => c.demandLevel).filter(Boolean))); }, [careerPaths]);');

// 4. Calculate Match & Filter
const oldMatchAndFilterRegex = /\/\/ Filter careers based on search query[^]*?return Math\.round\(\(matchedCount \/ requiredSkills\.length\) \* 100\);\n  };/m;
const newMatchAndFilter = `// Calculate dynamic match percentage based on profile skills
  const calculateMatch = (requiredSkills: string[]) => {
    if (!requiredSkills || requiredSkills.length === 0) return 100;
    if (!profile?.skills || profile.skills.length === 0) return 0;
    const userSkillsLower = profile.skills.map(s => s.toLowerCase());
    const matchedCount = requiredSkills.filter(reqSkill =>
      userSkillsLower.includes(reqSkill.toLowerCase())
    ).length;
    return Math.round((matchedCount / requiredSkills.length) * 100);
  };

  // Filter and Sort careers
  const processedCareers = useMemo(() => {
    let result = careerPaths.filter(career => {
      const matchesSearch = career.title.toLowerCase().includes(searchQuery.toLowerCase()) || career.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = !selectedIndustry || career.industry === selectedIndustry;
      const matchesDemand = !selectedDemand || career.demandLevel?.toLowerCase().includes(selectedDemand.toLowerCase());
      return matchesSearch && matchesIndustry && matchesDemand;
    });
    if (sortBy !== "none") {
      result.sort((a, b) => {
        if (sortBy === "match") return calculateMatch(b.requiredSkills) - calculateMatch(a.requiredSkills);
        if (sortBy === "salary") return b.salaryRange.localeCompare(a.salaryRange);
        if (sortBy === "demand") {
           const w = { "Very High": 4, "High": 3, "Medium": 2, "Low": 1 } as any;
           return (w[b.demandLevel] || 0) - (w[a.demandLevel] || 0);
        }
        return 0;
      });
    }
    return result;
  }, [careerPaths, searchQuery, selectedIndustry, selectedDemand, sortBy, profile?.skills]);`;
content = content.replace(oldMatchAndFilterRegex, newMatchAndFilter);

// 5. Add select dropdown
const oldButtonRegex = /<button\s+onClick=\{\(\) => setFilterOpen\(prev => !prev\)\}/;
const newButton = `<div className="flex-none hidden sm:block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-full px-3 py-2 bg-background border border-input rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer"
            >
              <option value="none">Sort: Default</option>
              <option value="match">Match %</option>
              <option value="demand">Demand</option>
              <option value="salary">Salary</option>
            </select>
          </div>
          <button
            onClick={() => setFilterOpen(prev => !prev)}`;
content = content.replace(oldButtonRegex, newButton);

// 6. Map array
content = content.replace(/filteredCareers\.length === 0/g, 'processedCareers.length === 0');
content = content.replace(/filteredCareers\.map\(\(career\)/g, 'processedCareers.map((career)');

fs.writeFileSync('src/app/components/feature-pages.tsx', content);
console.log('Success apply feature-pages.tsx');
