import { defineEventHandler, createError, sendProxy } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Get the path from the URL instead of params
    const path = event.path.replace('/sitemaps/', '').replace('.xml', '')
    console.log('Requested sitemap path:', path)
    
    // If no path is provided, return 404
    if (!path) {
      throw createError({
        statusCode: 404,
        message: 'Sitemap not found'
      })
    }

    // Construct the target URL
    const targetUrl = `https://sitemaps-multi-3dyyx.ondigitalocean.app/sitemaps/${path}.xml`
    console.log('Proxying to:', targetUrl)

    // Proxy the request to the DigitalOcean URL
    return sendProxy(event, targetUrl, {
      // Ensure we preserve the original request headers
      headers: {
        'Accept': 'application/xml',
        'Cache-Control': 'public, max-age=43200'
      }
    })
  } catch (error) {
    console.error('Error proxying sitemap:', error)
    
    // For any errors, return 500
    throw createError({
      statusCode: 500,
      message: 'Error proxying sitemap'
    })
  }
}) 