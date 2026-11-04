// Development defaults to fixtures so a fresh local checkout is immediately
// usable. Production is opt-in only, while VITE_ENABLE_MOCK=false disables
// fixtures even during development.
const isMockEnabled = () => import.meta.env.VITE_ENABLE_MOCK === 'true'
  || (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK !== 'false')
  || (typeof window !== 'undefined' && window.localStorage.getItem('onbeat-enable-mock') === 'true');

const isAuthorizationError = (error) => [401, 403].includes(Number(error?.response?.status));

/**
 * Read-only services use this shared boundary so pages never need to decide
 * between production data and fixtures. Empty predicates stay endpoint-specific
 * because a valid empty search result must not become sample data.
 */
export const withMockFallback = async (request, mockValue, isEmpty = () => false) => {
  try {
    const response = await request();
    if (isMockEnabled() && isEmpty(response)) return typeof mockValue === 'function' ? mockValue() : mockValue;
    return response;
  } catch (error) {
    if (!isMockEnabled() || isAuthorizationError(error)) throw error;
    console.info('[OnBeat mock] API fallback enabled:', error?.config?.url ?? 'request');
    return typeof mockValue === 'function' ? mockValue() : mockValue;
  }
};

export const isMockFallbackEnabled = isMockEnabled;
