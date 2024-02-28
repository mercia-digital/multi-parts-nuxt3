export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.fullPath.startsWith('/search/')) {
    const segments = to.fullPath.split('/').filter(Boolean).map(decodeURI);
    const params = {};

    for (let i = 1; i < segments.length; i += 2) {
      params[segments[i]] = segments[i + 1];
    }

    // Construct the query string from params
    const queryString = new URLSearchParams(params).toString().replace(/\+/g, '%20');

    // Redirect with a 301 Moved Permanently status code
    return navigateTo(`/?${queryString}`, { redirectCode: 301 })
  }
})