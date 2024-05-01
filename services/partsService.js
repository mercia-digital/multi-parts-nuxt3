export const usePartsService = () => {
  const fetchParts = async ({ page = 1, limit = 25, term = '', manufacturer = '', modality = '' }) => {
    // Base query parameters
    const queryParams = new URLSearchParams({
      sort: '-sort,part_number',
      meta: 'filter_count,total_count',
      'fields[]': ['part_number', 'display_part_number', 'manufacturer.*', 'title', 'primary_image.*'],
      limit: limit.toString(),
      page: page.toString(),
    });
  
    // Initialize the filter object
    let filters = {
      _and: [
        { status: { _neq: "archived" } } // Always exclude archived items
      ]
    };
  
    // Add manufacturer filter if provided
    if (manufacturer && manufacturer.trim()) {
      filters._and.push({ "manufacturer" : { "name" : { _eq: manufacturer }} });
    }
  
    // Add modality filter if provided
    if (modality && modality.trim()) {
      filters._and.push({ "modalities" : { "modalities_id" : { "name" : { _eq: modality }}} });
    }
  
    // Include the search term in the query parameters if provided
    if (term && term.trim()) {
      queryParams.set('search', term);
    }
  
    // Convert filters object to a JSON string and encode it for URL
    if (filters._and.length > 1) { // Check if we have more than the default filter
      queryParams.set('filter', JSON.stringify(filters));
    }
  
    const queryString = queryParams.toString();
    const { data, error } = await useFetch(`https://order.multi-inc.com/items/parts?${queryString}`);
    //const { data, error } = await useFetch(`http://localhost:8055/items/parts?${queryString}`);
  
    return { data, error };
  };

  const fetchPartDetails = async (partNumber) => {
    const response = await $fetch(`https://order.multi-inc.com/items/parts/${partNumber}?fields=part_number,display_part_number,content,title,primary_image,gallery.*.*,manufacturer.*,modalities.*.name,condition,warranty,returnable`);
    
    // Check if 'content' is null and replace it with an empty string if so
    if (response.data.content == null) {
        response.data.content = '';
    }

    // Process primary image
    let images = [];
    if (response.data.primary_image) {
      images.push({
        id: response.data.primary_image,
        src: `https://order.multi-inc.com/assets/${response.data.primary_image}?fit=inside&width=600&height=600`,
        alt: response.data.title
      });
    } else {
      const settings = await $fetch(`https://order.multi-inc.com/items/application_settings?fields=default_image`);
      images.push({
        id: settings.data.default_image,
        src: `https://order.multi-inc.com/assets/${settings.data.default_image}?fit=inside&width=600&height=600`
      });
      response.data.primary_image = settings.data.default_image;
    }

    // Process gallery images and append to images array
    if (response.data.gallery && response.data.gallery.length > 0) {
      images = images.concat(response.data.gallery.map(img => ({
        id: img.directus_files_id.id,
        src: `https://order.multi-inc.com/assets/${img.directus_files_id.id}?fit=inside&width=600&height=600`,
        alt: img.directus_files_id.title || response.data.title
      })));
    }

    response.data.gallery = images;

    return response.data;
  };

  return { fetchParts, fetchPartDetails };
};