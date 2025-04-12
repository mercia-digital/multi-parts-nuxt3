import { usePartsService } from '~/services/partsService';

export default defineCachedEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const partsService = usePartsService()

  // Fetch manufacturer and their parts
  const manufacturer = await partsService.getManufacturerBySlug(slug)
  if (!manufacturer) {
    throw createError({
      statusCode: 404,
      message: 'Manufacturer not found'
    })
  }

  // Get all parts by this manufacturer without pagination
  const partsResponse = await partsService.getPartsByManufacturer(manufacturer.id, 1, -1)
  
  // Transform and validate the data
  const parts = (partsResponse.data || []).map(part => ({
    part_number: part.part_number,
    display_part_number: part.display_part_number,
    title: part.title
  }))

  return {
    manufacturer,
    parts,
    totalItems: partsResponse.meta?.filter_count || 0
  }
}, {
  maxAge: 86400, // 24 hours
  staleMaxAge: 3600, // 1 hour
  swr: true, // Enable stale-while-revalidate
  base: 'sitemap' // Cache key prefix
}) 