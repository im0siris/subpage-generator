// N8N Function Node - Prepare prompt for subpage TSX generation
const job = items[0].json;

// Get the LLM-generated description from the previous node
const domainDescription = job.description || job.llm_output || '';

// Initialize array for processed cities
const processedItems = [];

// Process each city to create individual subpage generation requests
if (job.cities && Array.isArray(job.cities)) {
  for (const city of job.cities) {
    const subpagePrompt = `Generate a complete Next.js TSX subpage component for a local business directory.

**Business Context:**
- Domain: ${job.domain}
- Business Type: ${job.branche || 'Local Business'}
- City: ${city.name || city.city_name}
- Postcode: ${city.postcode}
- Country: ${city.country || 'Germany'}
- Business Description: ${domainDescription}

**Requirements:**
1. Create a SEO-optimized React TSX component
2. Use Tailwind CSS for styling
3. Include proper meta tags and structured data
4. Add local business schema markup
5. Include contact information placeholders
6. Add breadcrumb navigation
7. Make it responsive and accessible
8. Include a call-to-action section

**Component Structure:**
- Header with business name and location
- Hero section with local focus
- Services/products section
- Contact information
- Footer with local details

The component should be named after the city (e.g., "MunichPage") and be production-ready.

Please generate ONLY the TSX code without any explanations or markdown formatting.`;

    processedItems.push({
      json: {
        ...job,
        current_city: city,
        subpage_prompt: subpagePrompt,
        page_name: `${city.name || city.city_name}Page`,
        file_name: `${(city.name || city.city_name).toLowerCase().replace(/\s+/g, '-')}.tsx`
      }
    });
  }
} else {
  throw new Error("No cities found in job data");
}

return processedItems;