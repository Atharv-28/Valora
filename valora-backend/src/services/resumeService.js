const PDFParser = require('pdf-parse');

class ResumeService {
    async extractTextFromPDF(pdfBuffer) {
        try {
            const data = await PDFParser(pdfBuffer);
            return data.text;
        } catch (error) {
            console.error('Error parsing PDF:', error);
            throw new Error('Failed to parse resume PDF');
        }
    }

    extractKeyInformation(resumeText) {
        // Basic extraction - can be enhanced with NLP libraries
        const info = {
            skills: this.extractSkills(resumeText),
            experience: this.extractExperience(resumeText),
            education: this.extractEducation(resumeText)
        };

        return info;
    }

    extractSkills(text) {
        // Simple keyword matching - can be improved
        const skillKeywords = [
            'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL',
            'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'AI',
            'TypeScript', 'Angular', 'Vue', 'MongoDB', 'PostgreSQL'
        ];

        const foundSkills = skillKeywords.filter(skill => 
            text.toLowerCase().includes(skill.toLowerCase())
        );

        return foundSkills;
    }

    extractExperience(text) {
        // Look for year patterns (e.g., 2020-2023, 3 years)
        const yearPattern = /(\d{4})\s*[-–]\s*(\d{4}|present)/gi;
        const matches = text.match(yearPattern);
        return matches ? matches.length : 0;
    }

    extractEducation(text) {
        const degreeKeywords = ['bachelor', 'master', 'phd', 'diploma', 'degree'];
        const foundDegrees = degreeKeywords.filter(degree => 
            text.toLowerCase().includes(degree)
        );
        return foundDegrees;
    }
}

module.exports = new ResumeService();
