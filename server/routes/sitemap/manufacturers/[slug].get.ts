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
  const parts = (partsResponse.data || []).map(part => {
    // Ensure required fields exist
    if (!part.part_number) {
      console.warn('Part missing part_number:', part);
    }
    
    // Transform image data
    if (part.primary_image) {
      part.primary_image = {
        id: typeof part.primary_image === 'object' ? part.primary_image.id : part.primary_image,
        src: `https://order.multi-inc.com/assets/${typeof part.primary_image === 'object' ? part.primary_image.id : part.primary_image}?fit=inside&width=100&height=100`,
        alt: part.title || 'Part Image'
      };
    }
    
    // Ensure manufacturer data is properly structured
    if (part.manufacturer && typeof part.manufacturer === 'string') {
      part.manufacturer = { name: part.manufacturer };
    }
    
    return part;
  })

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