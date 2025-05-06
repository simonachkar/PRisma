const { fetchPullRequestDiff, postReviewComments } = require('./githubService');
const { analyzeCodeWithGemini } = require('./aiService');

/**
 * Processes a pull request by fetching the diff,
 * analyzing it with AI, and posting review comments
 */
async function processPullRequest(payload) {
  try {
    const prNumber = payload.pull_request.number;
    const repoOwner = payload.repository.owner.login;
    const repoName = payload.repository.name;
    
    console.log(`Processing PR #${prNumber} for ${repoOwner}/${repoName}`);
    
    // Step 1: Fetch PR diff and metadata
    const diff = await fetchPullRequestDiff(repoOwner, repoName, prNumber);
    
    // Step 2: Analyze with AI
    const aiAnalysis = await analyzeCodeWithGemini(diff, payload.pull_request);
    
    // Step 3: Post review comments
    await postReviewComments(repoOwner, repoName, prNumber, aiAnalysis);
    
    console.log(`Successfully processed PR #${prNumber}`);
  } catch (error) {
    console.error('Error processing pull request:', error);
    throw error;
  }
}

module.exports = {
  processPullRequest
};
