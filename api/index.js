const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { scholarid } = req.query;

  if (scholarid) {
    const url = `https://raw.githubusercontent.com/ezefranca/google-scholar/main/public/${scholarid}.json`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        return res.status(200).json(json);
      } else {
        return res.status(response.status).json({ error: 'Error fetching publications' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // If no scholarid query parameter, return a 400 error or a default response
  return res.status(400).json({ error: 'scholarid query parameter is required' });
};
