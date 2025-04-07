export const useCollectionService = () => {
  const fetchCollection = async ({ collection = '' }) => {
    let _sort = '';
    switch (collection) {
      case "manufacturers":
        _sort = 'order';
        break;
      case "modalities":
        _sort = 'sort';
        break;
      default:
        _sort = 'id'; // Fallback sort if needed
    }
    const queryParams = new URLSearchParams({
      sort: _sort,
      meta: 'filter_count,total_count',
    });

    const queryString = queryParams.toString();
    const url = `https://order.multi-inc.com/items/${collection}?${queryString}`;
    const { data, error } = await useFetch(url);

    if (error.value) {
      console.error("Error fetching collection:", error.value);
    }

    return { data, error };
  };

  return { fetchCollection };
};