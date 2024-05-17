document.addEventListener('DOMContentLoaded', function() {
  // Event listener for the search form submission
  document.getElementById('scholar-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const scholarIdOrUrl = document.getElementById('scholar-id').value;
    
    // Validate input before proceeding
    if (!isValidGoogleScholarInput(scholarIdOrUrl)) {
      alert('Invalid Google Scholar ID or URL');
      return;
    }
    
    const sortby = getSortByValues();
    clearPreviousState();
    checkIfExists(scholarIdOrUrl, sortby);
  });

  // Event listener for the update button
  document.getElementById('update-button').addEventListener('click', function() {
    const scholarIdOrUrl = document.getElementById('scholar-id').value;
    
    // Validate input before proceeding
    if (!isValidGoogleScholarInput(scholarIdOrUrl)) {
      alert('Invalid Google Scholar ID or URL');
      return;
    }

    const sortby = getSortByValues();
    triggerUpdate(scholarIdOrUrl, sortby);
  });

  function getSortByValues() {
    const checkboxes = document.querySelectorAll('input[name="sortby"]:checked');
    let values = [];
    checkboxes.forEach((checkbox) => {
      values.push(checkbox.value);
    });
    // Set default value if no checkbox is selected
    if (values.length === 0) {
      values.push('pubdate'); // Default sort value
    }
    return values;
  }

  function isValidGoogleScholarURL(url) {
    const googleScholarUrlPattern = /^https:\/\/scholar\.google\.com\/citations\?user=[a-zA-Z0-9_-]{12}$/;
    return googleScholarUrlPattern.test(url);
  }

  function isValidGoogleScholarID(id) {
    const googleScholarIdPattern = /^[a-zA-Z0-9_-]{12}$/;
    return googleScholarIdPattern.test(id);
  }

  function isValidGoogleScholarInput(input) {
    return isValidGoogleScholarURL(input) || isValidGoogleScholarID(input);
  }

});

/**
 * Check if the publication JSON already exists.
 * If it exists, display it and show the "Update" button.
 * If it doesn't exist, fetch the publications.
 */
async function checkIfExists(scholarIdOrUrl, sortby) {
  let scholarId = extractScholarId(scholarIdOrUrl);
  if (!scholarId) {
    alert('Invalid Google Scholar ID or URL');
    return;
  }

  showLoader();

  const url = `https://google-scholar-six.vercel.app/api?scholarid=${scholarId}`;
  const response = await fetch(url);

  if (response.ok) {
    const jsonResult = await response.json();
    displayResults(jsonResult);
    displayApiUrl(scholarId);
    hideLoader();
    document.getElementById('update-button').style.display = 'block';
  } else {
    triggerFetch(scholarId, sortby, 'fetch');
  }
}

/**
 * Trigger a fetch or update for Google Scholar publications.
 */
async function triggerFetch(scholarId, sortby, action) {
  const endpoint = action === 'fetch' ? '/api/trigger-github-action' : '/api/trigger-github-action';
  
  showLoader();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ scholarId, sortby })
  });

  if (response.ok) {
    checkForResults(scholarId);
    if (action === 'fetch') {
      displayApiUrl(scholarId);
    }
  } else {
    hideLoader();
    alert(`Error ${action === 'fetch' ? 'fetching' : 'updating'} publications`);
  }
}

/**
 * Trigger an update to fetch the latest publications.
 */
async function triggerUpdate(scholarIdOrUrl, sortby) {
  let scholarId = extractScholarId(scholarIdOrUrl);
  if (!scholarId) {
    alert('Invalid Google Scholar ID or URL');
    return;
  }

  triggerFetch(scholarId, sortby, 'update');
}

/**
 * Check if the results are available and display them.
 */
async function checkForResults(scholarId) {
  let attempts = 0;
  const maxAttempts = 10;
  const interval = 20000;

  const intervalId = setInterval(async () => {
    attempts++;
    const apiUrl = `https://google-scholar-six.vercel.app/api?scholarid=${scholarId}`;
    const response = await fetch(apiUrl);

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

/**
 * Extract the Google Scholar ID from the input.
 */
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

/**
 * Display the API URL for the fetched publications.
 */
function displayApiUrl(scholarId) {
  const apiUrl = `https://${window.location.hostname}/api?scholarid=${scholarId}`;
  const apiUrlElement = document.getElementById('api-url');
  apiUrlElement.textContent = apiUrl;
  apiUrlElement.href = apiUrl;
  document.getElementById('api-url-container').style.display = 'block';
}

/**
 * Display the fetched publications in JSON format.
 */
function displayResults(jsonResult) {
  const formattedJson = JSON.stringify(jsonResult, null, 2);
  const jsonResultElement = document.getElementById('json-result');
  jsonResultElement.textContent = formattedJson;
  
  // Trigger Highlight.js to highlight the code
  hljs.highlightElement(jsonResultElement);

  document.getElementById('result-container').style.display = 'block';
}

/**
 * Copy the JSON result to the clipboard.
 */
function copyToClipboard() {
  const jsonResultElement = document.getElementById('json-result');
  const textArea = document.createElement('textarea');
  textArea.value = jsonResultElement.textContent;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  alert('Copied to clipboard');
}

/**
 * Show the loader animation.
 */
function showLoader() {
  clearPreviousState();
  document.getElementById('loader').style.display = 'block';
  document.querySelector('button[type="submit"]').disabled = true;
  document.getElementById('update-button').disabled = true;
}

/**
 * Hide the loader animation.
 */
function hideLoader() {
  document.getElementById('loader').style.display = 'none';
  document.querySelector('button[type="submit"]').disabled = false;
  document.getElementById('update-button').disabled = false;
}

/**
 * Clear the previous state before a new search.
 */
function clearPreviousState() {
  document.getElementById('result-container').style.display = 'none';
  document.getElementById('json-result').value = '';
  document.getElementById('api-url-container').style.display = 'none';
  document.getElementById('update-button').style.display = 'none';
}

function downloadJson() {
  const jsonResultElement = document.getElementById('json-result');
  const formattedJson = jsonResultElement.textContent;
  const blob = new Blob([formattedJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'publications.json';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}


