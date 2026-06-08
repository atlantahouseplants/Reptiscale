(function () {
  const STORAGE_KEY = 'sunscaleDemoLead';
  const DEFAULTS = {
    locationId: 'oCn199rzTjj0rPgqXyXU',
    species_interest: 'Crested Gecko',
  };

  function readStoredLead() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveLead(payload) {
    const current = readStoredLead();
    const next = {
      ...current,
      ...Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
      ),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function payloadFromForm(form) {
    const data = new FormData(form);
    const payload = {};
    for (const [key, value] of data.entries()) {
      assignPayloadValue(payload, key, value);
    }
    return payload;
  }

  function assignPayloadValue(payload, key, value) {
    const match = key.match(/^([^\[]+)\[([^\]]+)\]$/);
    if (!match) {
      payload[key] = value;
      return;
    }

    const [, parent, child] = match;
    payload[parent] = payload[parent] || {};
    payload[parent][child] = value;
  }

  function payloadFromDataset(element) {
    const payload = {};
    for (const [key, value] of Object.entries(element.dataset)) {
      if (key.startsWith('payload')) {
        const payloadKey = key.replace(/^payload/, '');
        const normalizedKey = payloadKey.charAt(0).toLowerCase() + payloadKey.slice(1);
        payload[normalizedKey] = value;
      }
    }
    return payload;
  }

  function statusElement(container) {
    let status = container.querySelector('.form-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'form-status';
      status.setAttribute('role', 'status');
      container.appendChild(status);
    }
    return status;
  }

  function setBusy(target, busy) {
    const controls = target.matches('form')
      ? target.querySelectorAll('button, input, select, textarea')
      : [target];
    controls.forEach((control) => {
      if ('disabled' in control) control.disabled = busy;
      control.setAttribute('aria-busy', busy ? 'true' : 'false');
    });
  }

  async function submitWebhook(endpoint, payload) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...DEFAULTS,
        ...readStoredLead(),
        ...payload,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  }

  function attachForms() {
    document.querySelectorAll('form[data-endpoint]').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const endpoint = form.dataset.endpoint;
        const payload = payloadFromForm(form);
        const status = statusElement(form);
        setBusy(form, true);
        status.className = 'form-status';
        status.textContent = 'Sending...';

        try {
          const result = await submitWebhook(endpoint, payload);
          if (endpoint.includes('/lead-magnet')) {
            saveLead({ ...payload, contactId: result.contactId });
          }
          status.className = 'form-status success';
          status.textContent = form.dataset.success || 'Done. The demo account has been updated.';
          form.dataset.lastContactId = result.contactId || '';
        } catch (error) {
          status.className = 'form-status error';
          status.textContent = error.message || 'Something went wrong.';
        } finally {
          setBusy(form, false);
        }
      });
    });
  }

  function attachWebhookLinks() {
    document.querySelectorAll('[data-webhook-endpoint]').forEach((element) => {
      element.addEventListener('click', async (event) => {
        event.preventDefault();
        const endpoint = element.dataset.webhookEndpoint;
        const payload = payloadFromDataset(element);
        const href = element.getAttribute('href');
        const parent = element.closest('section') || element.parentElement || document.body;
        const status = statusElement(parent);
        setBusy(element, true);
        status.className = 'form-status';
        status.textContent = 'Updating demo account...';

        try {
          await submitWebhook(endpoint, payload);
          status.className = 'form-status success';
          status.textContent = element.dataset.success || 'Demo account updated.';
          if (href) window.location.href = href;
        } catch (error) {
          status.className = 'form-status error';
          status.textContent = error.message || 'Something went wrong.';
        } finally {
          setBusy(element, false);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    attachForms();
    attachWebhookLinks();
  });
})();
