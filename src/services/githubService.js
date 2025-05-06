const axios = require('axios');

// GitHub API client
const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  }
});

/**
 * Fetches the diff for a pull request
 */
async function fetchPullRequestDiff(owner, repo, prNumber) {
  try {
    const response = await githubClient.get(
      `/repos/${owner}/${repo}/pulls/${prNumber}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.diff'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching PR diff:', error);
    throw error;
  }
}

/**
 * Posts review comments to GitHub
 */
async function postReviewComments(owner, repo, prNumber, analysis) {
  try {
    // Create a new review
    const review = {
      commit_id: analysis.commitId,
      body: analysis.summary || 'PRisma AI Review',
      event: 'COMMENT',
      comments: analysis.comments.map(comment => ({
        path: comment.file,
        position: comment.position,
        body: comment.body
      }))
    };
    
    await githubClient.post(
      `/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
      review
    );
  } catch (error) {
    console.error('Error posting review comments:', error);
    throw error;
  }
}

module.exports = {
  fetchPullRequestDiff,
  postReviewComments
};
