const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { scholarId } = req.body;
  const token = process.env.GITHUB_TOKEN;
  const repo = 'ezefranca/google-scholar';
  const url = `https://api.github.com/repos/${repo}/dispatches`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${token}`
    },
    body: JSON.stringify({
      event_type: 'fetch-scholar-publications',
      client_payload: {
        scholar_id: scholarId
      }
    })
  });

  if (response.ok) {
    res.status(200).json({ message: 'GitHub Action triggered successfully.' });
  } else {
    res.status(500).json({ message: 'Error triggering GitHub Action.' });
  }
};
