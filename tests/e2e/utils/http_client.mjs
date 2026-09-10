import { config } from '../config.mjs';

/**
 * Robust HTTP client for opaque-box REST testing
 */
export class HttpClient {
  constructor(baseUrl = config.baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  setBaseUrl(newUrl) {
    this.baseUrl = newUrl.replace(/\/+$/, '');
  }

  async request(method, path, options = {}) {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    const headers = { ...options.headers };

    let body = options.body;
    if (body && typeof body === 'object' && !(body instanceof URLSearchParams) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || config.timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
      } else {
        data = await response.text().catch(() => '');
      }

      return {
        status: response.status,
        ok: response.ok,
        headers: response.headers,
        data,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  get(path, options = {}) {
    return this.request('GET', path, options);
  }

  post(path, body, options = {}) {
    return this.request('POST', path, { ...options, body });
  }

  postForm(path, formParams, options = {}) {
    const params = new URLSearchParams(formParams);
    return this.request('POST', path, {
      ...options,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers,
      },
      body: params,
    });
  }

  put(path, body, options = {}) {
    return this.request('PUT', path, { ...options, body });
  }

  patch(path, body, options = {}) {
    return this.request('PATCH', path, { ...options, body });
  }

  delete(path, options = {}) {
    return this.request('DELETE', path, options);
  }
}

export const api = new HttpClient();
