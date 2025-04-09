import { defineEventHandler, createError, sendProxy } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Proxy the request to the DigitalOcean URL
    return sendProxy(event, 'https://sitemaps-multi-3dyyx.ondigitalocean.app/sitemaps/index.xml')
  } catch (error) {
    console.error('Error proxying sitemap index:', error)
    
    // For any errors, return 500
    throw createError({
      statusCode: 500,
      message: 'Error proxying sitemap index'
    })
  }
}) 