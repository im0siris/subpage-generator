// N8N Function Node - Extract POST data and prepare for PostgreSQL
// This function processes the incoming webhook data and structures it for database insertion

// Get the incoming data from the webhook
const incomingData = $input.all();

// Initialize array to store processed items
const processedItems = [];

// Process each incoming item (usually just one for webhook)
for (const item of incomingData) {
  try {
    // Extract the body data from the webhook request
    const body = item.json.body || item.json;

    // Log the incoming data for debugging
    console.log('Incoming webhook data:', JSON.stringify(body, null, 2));

    // Extract job_id from the request body
    const job_id = body.job_id || `fallback_${Date.now()}`;

    // Extract domain - remove any protocol and trailing slashes
    const rawDomain = body.domain || '';
    const cleanDomain = rawDomain
      .replace(/^https?:\/\//, '')  // Remove http:// or https://
      .replace(/^www\./, '')        // Remove www.
      .replace(/\/$/, '')           // Remove trailing slash
      .toLowerCase()
      .trim();

    // Extract branche and description
    const branche = body.branche || '';
    const description = body.description || '';

    // Extract cities array
    const cities = body.cities || [];

    // Process each city in the request
    for (const city of cities) {
      const processedItem = {
        // Job ID - CRITICAL: Add this field
        job_id: job_id,

        // Domain information
        domain: cleanDomain,
        raw_domain: body.domain || '',

        // Business information
        branche: branche,
        description: description,

        // City information
        city_name: city.name || '',
        postcode: city.postcode || '',
        country: city.country || 'Germany',

        // Cities object - Add this field for n8n (create proper object format)
        cities: {
          name: city.name || '',
          postcode: city.postcode || '',
          country: city.country || 'Germany'
        },

        // Metadata
        request_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'pending', // You can track processing status

        // Additional fields that might be useful
        full_location: `${city.name}${city.postcode ? ', ' + city.postcode : ''}, ${city.country || 'Germany'}`,

        // Generate a unique identifier for this subpage request
        subpage_id: `${cleanDomain}_${city.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${city.postcode || 'no_postcode'}`,

        // Store original request for reference
        original_request: JSON.stringify(body)
      };

      // Add the processed item to our array
      processedItems.push({
        json: processedItem,
        pairedItem: item.pairedItem
      });
    }

    // If no cities provided, still create a record with just domain info
    if (cities.length === 0) {
      const processedItem = {
        job_id: job_id,  // Add job_id here too
        domain: cleanDomain,
        raw_domain: body.domain || '',
        branche: branche,
        description: description,
        city_name: '',
        postcode: '',
        country: '',
        cities: {}, // Empty cities object
        request_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'error_no_cities',
        full_location: '',
        subpage_id: `${cleanDomain}_no_city`,
        original_request: JSON.stringify(body)
      };

      processedItems.push({
        json: processedItem,
        pairedItem: item.pairedItem
      });
    }

  } catch (error) {
    console.error('Error processing webhook data:', error);

    // Create an error record
    processedItems.push({
      json: {
        job_id: `error_${Date.now()}`,  // Add job_id for error cases too
        domain: '',
        raw_domain: '',
        branche: '',
        description: '',
        city_name: '',
        postcode: '',
        country: '',
        cities: {}, // Empty cities object for errors
        request_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'error_processing',
        full_location: '',
        subpage_id: `error_${Date.now()}`,
        original_request: JSON.stringify(item.json),
        error_message: error.message
      },
      pairedItem: item.pairedItem
    });
  }
}

// Return the processed items
return processedItems;