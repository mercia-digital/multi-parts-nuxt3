export const usePartsService = () => {
  const fetchParts = async ({ page = 1, limit = 25, term = '', manufacturer = '', modality = '' }) => {
    // Base query parameters
    const queryParams = new URLSearchParams({
      sort: '-sort,part_number',
      meta: 'filter_count,total_count',
      'fields[]': ['part_number', 'display_part_number', 'manufacturer.*', 'manufacturer.logo.*', 'title', 'primary_image.*'],
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
      // Use the exact filter structure that works with Directus
      filters._and.push({ 
        _and: [
          { manufacturer: { name: { _eq: manufacturer } } }
        ]
      });
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
    
    return { data, error };
  };

  const fetchPartDetails = async (partNumber) => {
    const response = await $fetch(`https://order.multi-inc.com/items/parts/${partNumber}?fields=part_number,display_part_number,content,title,primary_image,gallery.*.*,manufacturer.*,manufacturer.logo.*,modalities.*.name,condition,warranty,returnable,attributes`);
    
    // Check if 'content' is null and replace it with an empty string if so
    if (response.data.content == null) {
        response.data.content = '';
    }

    // Process primary image
    let images = [];
    if (response.data.primary_image) {
      let primary = {
        id: response.data.primary_image,
        src: `https://order.multi-inc.com/assets/${response.data.primary_image}?fit=inside&width=600&height=600`,
        alt: response.data.title
      };
      images.push(primary);
      response.data.primary_image = primary;
    } else {
      const settings = await $fetch(`https://order.multi-inc.com/items/application_settings?fields=default_image`);
      let default_image = {
        id: settings.data.default_image,
        src: `https://order.multi-inc.com/assets/${settings.data.default_image}?fit=inside&width=600&height=600`,
        alt: "MULTI, INC. Logo"
      };
      images.push(default_image);
      response.data.primary_image = default_image;
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

  // Get manufacturer by slug
  const getManufacturerBySlug = async (slug) => {
    try {
      const response = await $fetch(`https://order.multi-inc.com/items/manufacturers?filter[slug][_eq]=${slug}&fields=id,name,slug,description,logo.*`);
      
      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching manufacturer by slug:', error);
      return null;
    }
  };

  // New method to get parts by manufacturer ID
  const getPartsByManufacturer = async (manufacturerId, page = 1, limit = 25) => {
    try {
      // First get the manufacturer name using the ID
      const manufacturerResponse = await $fetch(`https://order.multi-inc.com/items/manufacturers/${manufacturerId}?fields=name`);
      
      if (!manufacturerResponse.data || !manufacturerResponse.data.name) {
        return { data: [], meta: { filter_count: 0, total_count: 0 } };
      }
      
      const manufacturerName = manufacturerResponse.data.name;
      
      // Query parts using the manufacturer name with the exact filter structure from Postman
      const queryParams = new URLSearchParams({
        sort: '-sort,part_number',
        meta: 'filter_count,total_count',
        'fields[]': ['part_number', 'display_part_number', 'title', 'primary_image.*', 'manufacturer.*', 'manufacturer.logo.*'],
        limit: limit.toString(),
        page: page.toString(),
        'filter[manufacturer][name][_eq]': manufacturerName
      });
      
      const queryString = queryParams.toString();
      
      const response = await $fetch(`https://order.multi-inc.com/items/parts?${queryString}`);
      
      return response;
    } catch (error) {
      console.error('Error fetching parts by manufacturer:', error);
      return { data: [], meta: { filter_count: 0, total_count: 0 } };
    }
  };

  // Get parts by modality name
  const getPartsByModality = async (modalityName, page = 1, limit = 25) => {
    try {
      // Query parts using the modality name with the exact filter structure
      const queryParams = new URLSearchParams({
        sort: '-sort,part_number',
        meta: 'filter_count,total_count',
        'fields[]': ['part_number', 'display_part_number', 'title', 'primary_image.*', 'manufacturer.*', 'manufacturer.logo.*'],
        limit: limit.toString(),
        page: page.toString(),
      });

      // Add the modality filter
      const filters = {
        _and: [
          { status: { _neq: "archived" } },
          { "modalities": { "modalities_id": { "name": { _eq: modalityName } } } }
        ]
      };

      queryParams.set('filter', JSON.stringify(filters));
      
      const queryString = queryParams.toString();
      const response = await $fetch(`https://order.multi-inc.com/items/parts?${queryString}`);
      
      return response;
    } catch (error) {
      console.error('Error fetching parts by modality:', error);
      return { data: [], meta: { filter_count: 0, total_count: 0 } };
    }
  };

  // Get parts by manufacturer ID for sitemap (minimal fields)
  const getPartsByManufacturerForSitemap = async (manufacturerId, page = 1, limit = 25) => {
    try {
      // First get the manufacturer name using the ID
      const manufacturerResponse = await $fetch(`https://order.multi-inc.com/items/manufacturers/${manufacturerId}?fields=name`);
      
      if (!manufacturerResponse.data || !manufacturerResponse.data.name) {
        return { data: [], meta: { filter_count: 0, total_count: 0 } };
      }
      
      const manufacturerName = manufacturerResponse.data.name;
      
      // Query parts using the manufacturer name with minimal fields
      const queryParams = new URLSearchParams({
        sort: '-sort,part_number',
        meta: 'filter_count,total_count',
        'fields[]': ['part_number', 'display_part_number', 'title'],
        limit: limit.toString(),
        page: page.toString(),
        'filter[manufacturer][name][_eq]': manufacturerName
      });
      
      const queryString = queryParams.toString();
      
      const response = await $fetch(`https://order.multi-inc.com/items/parts?${queryString}`);
      
      return response;
    } catch (error) {
      console.error('Error fetching parts by manufacturer:', error);
      return { data: [], meta: { filter_count: 0, total_count: 0 } };
    }
  };

  // Get parts by modality name for sitemap (minimal fields)
  const getPartsByModalityForSitemap = async (modalityName, page = 1, limit = 25) => {
    try {
      // Query parts using the modality name with minimal fields
      const queryParams = new URLSearchParams({
        sort: '-sort,part_number',
        meta: 'filter_count,total_count',
        'fields[]': ['part_number', 'display_part_number', 'title'],
        limit: limit.toString(),
        page: page.toString(),
      });

      // Add the modality filter
      const filters = {
        _and: [
          { status: { _neq: "archived" } },
          { "modalities": { "modalities_id": { "name": { _eq: modalityName } } } }
        ]
      };

      queryParams.set('filter', JSON.stringify(filters));
      
      const queryString = queryParams.toString();
      const response = await $fetch(`https://order.multi-inc.com/items/parts?${queryString}`);
      
      return response;
    } catch (error) {
      console.error('Error fetching parts by modality:', error);
      return { data: [], meta: { filter_count: 0, total_count: 0 } };
    }
  };

  return { 
    fetchParts, 
    fetchPartDetails, 
    getManufacturerBySlug, 
    getPartsByManufacturer,
    getPartsByModality,
    getPartsByManufacturerForSitemap,
    getPartsByModalityForSitemap,
    getModalityBySlug // Add this line
  };
};

// Get modality by slug
const getModalityBySlug = async (slug) => {
  try {
    const response = await $fetch(`https://order.multi-inc.com/items/modalities?filter[slug][_eq]=${slug}&fields=id,name,slug,description`);
    
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching modality by slug:', error);
    return null;
  }
};

// Helper function to get manufacturer logo URL without size constraints
export const getManufacturerLogoUrl = (logo) => {
  if (!logo) return '';
  return `https://order.multi-inc.com/assets/${logo.id}`;
};