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

  const response = await fetch('/api/trigger-github-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ scholarId, sortby })
  });

  if (response.ok) {
    const jsonResult = await response.json();
    displayResults(jsonResult);
  } else {
    document.getElementById('result-container').style.display = 'none';
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