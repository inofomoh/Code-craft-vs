const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const deployBtn = document.getElementById('deployBtn');
const codeOutput = document.getElementById('codeOutput');
const aiPrompt = document.getElementById('aiPrompt');
const platformSelect = document.getElementById('platform');
const statusDiv = document.getElementById('status');

let currentCode = '';

generateBtn.addEventListener('click', async () => {
  const prompt = aiPrompt.value.trim();
  const platform = platformSelect.value;

  if (!prompt) {
    alert('Please enter a description.');
    return;
  }

  generateBtn.disabled = true;
  downloadBtn.disabled = true;
  deployBtn.disabled = true;
  statusDiv.textContent = 'Generating code with AI... ⏳';

  try {
    const response = await fetch('http://localhost:5000/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `Generate a ${platform} code for the following request:\n${prompt}` }),
    });

    if (!response.ok) throw new Error('AI generation failed.');

    const data = await response.json();
    currentCode = data.code.trim();
    codeOutput.value = currentCode;

    downloadBtn.disabled = false;
    deployBtn.disabled = platform === 'website' ? false : true;
    statusDiv.textContent = 'Code generated successfully!';

  } catch (error) {
    statusDiv.textContent = 'Error: Could not generate code.';
    alert(error.message);
  } finally {
    generateBtn.disabled = false;
  }
});

downloadBtn.addEventListener('click', () => {
  if (!currentCode) return;
  const blob = new Blob([currentCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `codecraft_${platformSelect.value}_code.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

deployBtn.addEventListener('click', async () => {
  if (!currentCode) return;

  deployBtn.disabled = true;
  statusDiv.textContent = 'Deploying website... ⏳';

  try {
    const siteName = prompt('Enter a unique site name (for deployment URL):');
    if (!siteName) {
      statusDiv.textContent = 'Deployment cancelled.';
      deployBtn.disabled = false;
      return;
    }

    const response = await fetch('http://localhost:5000/api/deploy/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ htmlCode: currentCode, siteName }),
    });

    if (!response.ok) throw new Error('Deployment failed.');

    const data = await response.json();
    statusDiv.innerHTML = `Deployed! Visit your site: <a href="${data.url}" target="_blank">${data.url}</a>`;

  } catch (error) {
    statusDiv.textContent = 'Error: Deployment failed.';
    alert(error.message);
  } finally {
    deployBtn.disabled = false;
  }
});