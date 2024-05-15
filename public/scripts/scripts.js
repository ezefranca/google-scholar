document.getElementById('scholar-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const scholarId = document.getElementById('scholar-id').value;
  fetchPublications(scholarId);
});

async function fetchPublications(scholarId) {
  const response = await fetch('/api/trigger-github-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ scholarId })
  });

  if (response.ok) {
    document.getElementById('result').innerText = 'Fetching publications, please wait...';
    checkForResults(scholarId);
  } else {
    document.getElementById('result').innerText = 'Error triggering the GitHub Action.';
  }
}

async function checkForResults(scholarId) {
  const url = `https://raw.githubusercontent.com/ezefranca/google-scholar/main/public/publications_${scholarId}.json`;
  let attempts = 0;
  const maxAttempts = 10;  
  const interval = 20000;

  const intervalId = setInterval(async () => {
    attempts++;
    const response = await fetch(url);

    if (response.ok) {
      clearInterval(intervalId);
      const publications = await response.json();
      displayResults(publications);
    } else if (attempts >= maxAttempts) {
      clearInterval(intervalId);
      document.getElementById('result').innerText = 'Failed to fetch publications.';
    }
  }, interval);
}

function displayResults(publications) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '<h2>Publications</h2>';
  const list = document.createElement('ul');
  publications.forEach(pub => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<strong>${pub.title}</strong><br>${pub.authors}<br><em>${pub.publication_venue}</em> (${pub.year})`;
    list.appendChild(listItem);
  });
  resultDiv.appendChild(list);
}
