// N8N Function Node - Process generated subpage code
const items = $input.all();
const processedResults = [];

for (const item of items) {
  const generatedCode = item.json.choices?.[0]?.message?.content || item.json.response || item.json;

  processedResults.push({
    json: {
      job_id: item.json.job_id,
      domain: item.json.domain,
      city: item.json.current_city,
      page_name: item.json.page_name,
      file_name: item.json.file_name,
      tsx_code: generatedCode,
      created_at: new Date().toISOString()
    }
  });
}

return processedResults;