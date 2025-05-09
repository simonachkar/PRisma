const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes code with Gemini AI
 */
async function analyzeCodeWithGemini(diff, pullRequest) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Construct the prompt
    const prompt = `
Prisma: AI-Powered Pull Request Reviewer

You are Prisma, an intelligent AI pull request reviewer. Analyze the provided
GitHub PR diff for:
● Potential bugs or logic errors.
● Deviations from best practices.
● Find security vulnerabilities.
● Recommendations for improved, more maintainable code.

Present your findings in a structured manner, including:
1. File and line number.
2. Identified issue.
3. Proposed fix or enhancement.

PR Title: ${pullRequest.title}
PR Description: ${pullRequest.body || 'No description provided'}

Here is the diff:
${diff}

Format your response as JSON with the following structure:
{
  "summary": "Overall summary of the PR",
  "commitId": "${pullRequest.head.sha}",
  "comments": [
    {
      "file": "path/to/file",
      "position": line_number,
      "body": "Your comment with issue and suggestion"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } else {
      throw new Error('Failed to parse AI response as JSON');
    }
  } catch (error) {
    console.error('Error analyzing code with Gemini:', error);
    throw error;
  }
}

module.exports = {
  analyzeCodeWithGemini
};
