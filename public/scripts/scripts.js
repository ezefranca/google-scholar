document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('scholar-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const scholarIdOrUrl = document.getElementById('scholar-id').value;
    const sortby = document.getElementById('sortby').value;
    fetchPublications(scholarIdOrUrl, sortby);
  });
});

async function fetchPublications(scholarIdOrUrl, sortby) {
  let scholarId = extractScholarId(scholarIdOrUrl);
  if (!scholarId) {
    alert('Invalid Google Scholar ID or URL');
    return;
  }

  showLoader();

  const response = await fetch('/api/trigger-github-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ scholarId, sortby })
  });

  if (response.ok) {
    checkForResults(scholarId);
  } else {
    hideLoader();
    alert('Error fetching publications');
  }
}

function extractScholarId(input) {
  if (input.includes('scholar.google.com')) {
    try {
      const url = new URL(input);
      return url.searchParams.get('user');
    } catch (error) {
      console.error('Invalid URL:', error);
      return null;
    }
  }
  return input;
}

async function checkForResults(scholarId) {
  let attempts = 0;
  const maxAttempts = 20;  // Adjust this based on your workflow completion time
  const interval = 5000;  // 5 seconds

  const intervalId = setInterval(async () => {
    attempts++;
    const url = `https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/main/public/publications_${scholarId}.json`;
    const response = await fetch(url);

    if (response.ok) {
      clearInterval(intervalId);
      const jsonResult = await response.json();
      displayResults(jsonResult);
      hideLoader();
    } else if (attempts >= maxAttempts) {
      clearInterval(intervalId);
      hideLoader();
      alert('Failed to fetch publications.');
    }
  }, interval);
}

function displayResults(jsonResult) {
  const formattedJson = JSON.stringify(jsonResult, null, 2);
  const jsonResultElement = document.getElementById('json-result');
  jsonResultElement.value = formattedJson;

  const blob = new Blob([formattedJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.getElementById('download-link');
  downloadLink.href = url;

  document.getElementById('result-container').style.display = 'block';
}

function copyToClipboard() {
  const jsonResult = document.getElementById('json-result');
  jsonResult.select();
  jsonResult.setSelectionRange(0, 99999); // For mobile devices
  document.execCommand('copy');
  alert('Copied to clipboard');
}

function showLoader() {
  document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}