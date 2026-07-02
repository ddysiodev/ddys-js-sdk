const DEFAULT_BASE_URL = 'https://ddys.io/api/v1';
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_USER_AGENT = '@ddys/js-sdk/0.1.0';

class DdysApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'DdysApiError';
    this.status = options.status;
    this.method = options.method || 'GET';
    this.endpoint = options.endpoint || '';
    this.response = options.response;
    this.cause = options.cause;
  }
}

class DdysTimeoutError extends DdysApiError {
  constructor(message, options = {}) {
    super(message, options);
    this.name = 'DdysTimeoutError';
  }
}

class DdysNetworkError extends DdysApiError {
  constructor(message, options = {}) {
    super(message, options);
    this.name = 'DdysNetworkError';
  }
}

class DdysParseError extends DdysApiError {
  constructor(message, options = {}) {
    super(message, options);
    this.name = 'DdysParseError';
  }
}

function createDdysClient(options = {}) {
  return new DdysClient(options);
}

class DdysClient {
  constructor(options = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl || DEFAULT_BASE_URL);
    this.apiKey = options.apiKey || '';
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchImpl = options.fetch || globalThis.fetch;
    this.headers = { ...(options.headers || {}) };
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
    this.retry = options.retry ?? false;

    if (typeof this.fetchImpl !== 'function') {
      throw new DdysApiError('No fetch implementation available. Pass options.fetch or use a runtime with global fetch.');
    }

    this.movies = createMovieEndpoints(this);
    this.dictionaries = createDictionaryEndpoints(this);
    this.collections = createCollectionEndpoints(this);
    this.shares = createShareEndpoints(this);
    this.requests = createRequestEndpoints(this);
    this.activities = createActivityEndpoints(this);
    this.users = createUserEndpoints(this);
    this.comments = createCommentEndpoints(this);
    this.reports = createReportEndpoints(this);
    this.follow = createFollowEndpoints(this);
  }

  async request(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const endpoint = normalizePath(path);
    const auth = Boolean(options.auth);

    if (auth && !this.apiKey) {
      throw new DdysApiError('DDYS API key is required for this endpoint.', {
        status: 401,
        method,
        endpoint
      });
    }

    const retryOptions = normalizeRetryOptions(options.retry ?? this.retry, method);
    const maxAttempts = retryOptions ? retryOptions.retries + 1 : 1;
    let attempt = 0;
    let lastError;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        return await this.requestOnce(endpoint, {
          ...options,
          method,
          auth
        });
      } catch (error) {
        lastError = error;
        if (!shouldRetry(error, retryOptions, method, attempt, maxAttempts)) {
          throw error;
        }
        await delay(retryOptions.delayMs * attempt);
      }
    }

    throw lastError;
  }

  async requestOnce(endpoint, options) {
    const method = options.method;
    const query = normalizeQuery(options.query);
    const url = buildUrl(this.baseUrl, endpoint, query);
    const headers = buildHeaders(this, options);
    const timeout = createTimeoutController(options.signal, options.timeoutMs ?? this.timeoutMs);

    const init = {
      method,
      headers,
      signal: timeout.signal
    };

    if (options.body !== undefined) {
      init.body = JSON.stringify(options.body);
    }

    let response;
    try {
      response = await this.fetchImpl(url, init);
    } catch (error) {
      if (timeout.timedOut()) {
        throw new DdysTimeoutError(`Request timed out after ${options.timeoutMs ?? this.timeoutMs}ms.`, {
          method,
          endpoint,
          cause: error
        });
      }
      throw new DdysNetworkError(error?.message || 'Network request failed.', {
        method,
        endpoint,
        cause: error
      });
    } finally {
      timeout.cleanup();
    }

    const text = await response.text();
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (error) {
      throw new DdysParseError('Failed to parse DDYS API response as JSON.', {
        status: response.status,
        method,
        endpoint,
        response: text,
        cause: error
      });
    }

    if (!response.ok || json?.success === false) {
      throw new DdysApiError(json?.message || `HTTP ${response.status}`, {
        status: response.status,
        method,
        endpoint,
        response: json
      });
    }

    if (json?.success !== true) {
      throw new DdysParseError('DDYS API response is missing success=true.', {
        status: response.status,
        method,
        endpoint,
        response: json
      });
    }

    return json;
  }

  async get(path, query, options = {}) {
    return this.request(path, { ...options, method: 'GET', query });
  }

  async post(path, body, options = {}) {
    return this.request(path, { ...options, method: 'POST', body });
  }

  async delete(path, options = {}) {
    return this.request(path, { ...options, method: 'DELETE' });
  }

  async search(params) {
    return unwrapPaginated(await this.get('/search', params));
  }

  async suggest(q) {
    return unwrapData(await this.get('/suggest', { q }));
  }

  async hot() {
    return unwrapData(await this.get('/hot'));
  }

  async latest(params = {}) {
    return unwrapData(await this.get('/latest', params));
  }

  async calendar(params = {}) {
    return unwrapData(await this.get('/calendar', params));
  }

  async me() {
    return unwrapData(await this.get('/me', undefined, { auth: true }));
  }
}

function createMovieEndpoints(client) {
  return {
    list(params = {}) {
      return client.get('/movies', normalizePagination(params)).then(unwrapPaginated);
    },
    detail(slug) {
      assertNonEmpty(slug, 'slug');
      return client.get(`/movies/${encodePathSegment(slug)}`).then(unwrapData);
    },
    sources(slug) {
      assertNonEmpty(slug, 'slug');
      return client.get(`/movies/${encodePathSegment(slug)}/sources`).then(unwrapData);
    },
    related(slug) {
      assertNonEmpty(slug, 'slug');
      return client.get(`/movies/${encodePathSegment(slug)}/related`).then(unwrapData);
    },
    comments(slug, params = {}) {
      assertNonEmpty(slug, 'slug');
      return client.get(`/movies/${encodePathSegment(slug)}/comments`, normalizePagination(params)).then(unwrapPaginated);
    }
  };
}

function createDictionaryEndpoints(client) {
  return {
    types() {
      return client.get('/types').then(unwrapData);
    },
    genres() {
      return client.get('/genres').then(unwrapData);
    },
    regions() {
      return client.get('/regions').then(unwrapData);
    }
  };
}

function createCollectionEndpoints(client) {
  return {
    list(params = {}) {
      return client.get('/collections', normalizePagination(params)).then(unwrapPaginated);
    },
    detail(slug, params = {}) {
      assertNonEmpty(slug, 'slug');
      return client.get(`/collections/${encodePathSegment(slug)}`, normalizePagination(params)).then((envelope) => ({
        ...unwrapData(envelope),
        meta: envelope.meta
      }));
    }
  };
}

function createShareEndpoints(client) {
  return {
    list(params = {}) {
      return client.get('/shares', normalizePagination(params)).then(unwrapPaginated);
    },
    detail(id) {
      assertPositiveInteger(id, 'id');
      return client.get(`/shares/${id}`).then(unwrapData);
    }
  };
}

function createRequestEndpoints(client) {
  return {
    list(params = {}) {
      return client.get('/requests', normalizePagination(params)).then(unwrapPaginated);
    },
    create(input) {
      assertObject(input, 'input');
      return client.post('/requests', input, { auth: true }).then(unwrapData);
    }
  };
}

function createActivityEndpoints(client) {
  return {
    list(params = {}) {
      return client.get('/activities', normalizePagination(params)).then(unwrapPaginated);
    }
  };
}

function createUserEndpoints(client) {
  return {
    profile(username) {
      assertNonEmpty(username, 'username');
      return client.get(`/user/${encodePathSegment(username)}`).then(unwrapData);
    }
  };
}

function createCommentEndpoints(client) {
  return {
    create(input) {
      assertObject(input, 'input');
      return client.post('/comments', input, { auth: true }).then(unwrapData);
    },
    delete(id) {
      assertPositiveInteger(id, 'id');
      return client.delete(`/comments/${id}`, { auth: true }).then(unwrapData);
    }
  };
}

function createReportEndpoints(client) {
  return {
    invalidResource(input) {
      assertObject(input, 'input');
      return client.post('/report', input, { auth: true }).then(unwrapData);
    }
  };
}

function createFollowEndpoints(client) {
  return {
    set(input) {
      assertObject(input, 'input');
      return client.post('/follow', input, { auth: true }).then(unwrapData);
    },
    follow(username) {
      assertNonEmpty(username, 'username');
      return client.post('/follow', { username, action: 'follow' }, { auth: true }).then(unwrapData);
    },
    unfollow(username) {
      assertNonEmpty(username, 'username');
      return client.post('/follow', { username, action: 'unfollow' }, { auth: true }).then(unwrapData);
    }
  };
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl).replace(/\/+$/, '');
}

function normalizePath(path) {
  const value = String(path || '');
  return value.startsWith('/') ? value : `/${value}`;
}

function encodePathSegment(value) {
  return encodeURIComponent(String(value));
}

function buildUrl(baseUrl, path, query) {
  const url = new URL(`${baseUrl}${normalizePath(path)}`);
  for (const [key, value] of Object.entries(query || {})) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== '') {
          url.searchParams.append(key, String(item));
        }
      }
      continue;
    }
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function normalizeQuery(query) {
  if (!query) {
    return {};
  }
  return normalizePagination(query);
}

function normalizePagination(params = {}) {
  const normalized = { ...params };
  if (normalized.perPage !== undefined && normalized.per_page === undefined) {
    normalized.per_page = normalized.perPage;
  }
  delete normalized.perPage;
  return normalized;
}

function buildHeaders(client, options) {
  const headers = {
    Accept: 'application/json',
    ...client.headers,
    ...(options.headers || {})
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (options.auth) {
    headers.Authorization = `Bearer ${client.apiKey}`;
  }

  if (client.userAgent && isNodeRuntime()) {
    headers['User-Agent'] = client.userAgent;
  }

  return headers;
}

function isBrowserRuntime() {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

function isNodeRuntime() {
  return typeof process !== 'undefined' && Boolean(process.versions?.node) && !isBrowserRuntime();
}

function createTimeoutController(externalSignal, timeoutMs) {
  if (typeof AbortController !== 'function') {
    return {
      signal: externalSignal,
      cleanup() {},
      timedOut() {
        return false;
      }
    };
  }

  const controller = new AbortController();
  let didTimeout = false;
  let timeoutId;

  const abortFromExternal = () => {
    controller.abort(externalSignal?.reason);
  };

  if (externalSignal?.aborted) {
    abortFromExternal();
  } else if (externalSignal) {
    externalSignal.addEventListener('abort', abortFromExternal, { once: true });
  }

  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort(new Error(`Request timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
  }

  return {
    signal: controller.signal,
    cleanup() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (externalSignal) {
        externalSignal.removeEventListener('abort', abortFromExternal);
      }
    },
    timedOut() {
      return didTimeout;
    }
  };
}

function normalizeRetryOptions(retry, method) {
  if (!retry || method !== 'GET') {
    return false;
  }
  if (retry === true) {
    return {
      retries: 1,
      delayMs: 250,
      statuses: [500, 502, 503, 504]
    };
  }
  return {
    retries: Math.max(0, Number(retry.retries ?? 1)),
    delayMs: Math.max(0, Number(retry.delayMs ?? 250)),
    statuses: retry.statuses || [500, 502, 503, 504]
  };
}

function shouldRetry(error, retryOptions, method, attempt, maxAttempts) {
  if (!retryOptions || method !== 'GET' || attempt >= maxAttempts) {
    return false;
  }
  if (error instanceof DdysNetworkError || error instanceof DdysTimeoutError) {
    return true;
  }
  return retryOptions.statuses.includes(error?.status);
}

function delay(ms) {
  if (!ms) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function unwrapData(envelope) {
  return envelope.data;
}

function unwrapPaginated(envelope) {
  return {
    data: envelope.data || [],
    meta: envelope.meta || {
      total: 0,
      page: 1,
      per_page: Array.isArray(envelope.data) ? envelope.data.length : 0,
      total_pages: 1
    }
  };
}

function assertNonEmpty(value, name) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new DdysApiError(`${name} is required.`);
  }
}

function assertPositiveInteger(value, name) {
  if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
    throw new DdysApiError(`${name} must be a positive integer.`);
  }
}

function assertObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new DdysApiError(`${name} must be an object.`);
  }
}

export {
  DEFAULT_BASE_URL,
  DdysApiError,
  DdysNetworkError,
  DdysParseError,
  DdysTimeoutError,
  DdysClient,
  createDdysClient
};

export default createDdysClient;
