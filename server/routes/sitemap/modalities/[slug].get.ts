import { usePartsService } from '~/services/partsService';

export default defineCachedEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const modalityName = decodeURIComponent(slug)
  const partsService = usePartsService()

  // Get all parts for this modality without pagination
  const partsResponse = await partsService.getPartsByModality(modalityName, 1, -1)
  
  // Transform and validate the data
  const parts = (partsResponse.data || []).map(part => ({
    part_number: part.part_number,
    display_part_number: part.display_part_number,
    title: part.title
  }))

  return {
    parts,
    totalItems: partsResponse.meta?.filter_count || 0
  }
}, {
  maxAge: 86400, // 24 hours
  staleMaxAge: 3600, // 1 hour
  swr: true, // Enable stale-while-revalidate
  base: 'sitemap' // Cache key prefix
}) 