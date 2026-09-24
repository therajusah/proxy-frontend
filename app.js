// Backend API base. Same-origin by default; set window.__API_BASE__ (see
// config.js) to the deployed backend URL when this site is hosted separately.
const API_BASE = (typeof window !== 'undefined' && window.__API_BASE__) || '';
const form = document.querySelector('[data-relay-form]');
const status = document.querySelector('[data-form-status]');

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = form.querySelector('input[name="url"]');
    const region = form.querySelector('select[name="region"]');
    const submit = form.querySelector('button[type="submit"]');
    status.textContent = '';
    status.className = 'form-status';
    status.removeAttribute('data-state');
    submit.disabled = true;
    submit.textContent = 'Checking relay…';
    // Open the relay tab synchronously inside the click gesture so popup
    // blockers allow it; its location is set once the session is created.
    const relayTab = window.open('about:blank', '_blank');
    try {
      if (!input.value.trim()) throw new Error('Add an approved destination first.');
      const response = await fetch(API_BASE + '/api/v1/sessions', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({url: input.value.trim(), region: region.value})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 429) throw new Error('The relay is busy for a moment. Wait a little, then try again.');
        if (response.status === 503) throw new Error('That relay region is not accepting new sessions right now. Choose another region.');
        throw new Error(data.detail || 'This destination is not available.');
      }
      // Open the relayed site in the new tab and keep this page in place.
      if (relayTab) { relayTab.location.href = data.browse_url; } else { window.location.href = data.browse_url; }
      status.dataset.state = 'success';
      const relayIp = data.egress_ip ? ` · relay IP ${data.egress_ip}` : '';
      status.textContent = `Opened in a new tab via ${data.region || 'your selected relay'}${relayIp}.`;
      submit.disabled = false;
      submit.textContent = 'Open securely';
    } catch (error) {
      if (relayTab) relayTab.close();
      status.dataset.state = 'error';
      status.textContent = error.message;
      submit.disabled = false;
      submit.textContent = 'Open securely';
      input.focus();
    }
  });
}
