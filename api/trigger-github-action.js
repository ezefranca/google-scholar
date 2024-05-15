const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const { scholarId } = req.body;
    console.log('Received scholarId:', scholarId);

    const token = process.env.GITHUB_TOKEN; 
    if (!token) {
      console.error('GITHUB_TOKEN not set');
      return res.status(500).json({ message: 'GITHUB_TOKEN not set' });
    }
    console.log('GITHUB_TOKEN is set');

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
      console.log('GitHub Action triggered successfully');
      res.status(200).json({ message: 'GitHub Action triggered successfully.' });
    } else {
      const errorText = await response.text();
      console.error('Error triggering GitHub Action:', errorText);
      res.status(500).json({ message: 'Error triggering GitHub Action.' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'A server error has occurred' });
  }
};
