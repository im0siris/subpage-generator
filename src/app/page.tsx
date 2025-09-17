'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { MagnifyingGlassIcon, BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Footer from '@/components/Footer';

interface City {
  name: string;
  postcode?: string;
  country?: string;
}

interface ZippopotamPlace {
  'place name': string;
  'post code': string;
}

interface ZippopotamResponse {
  'post code': string;
  places: Array<{
    'place name': string;
  }>;
}

interface JobStatus {
  job_id: string;
  status: string;
  message: string;
}

export default function Home() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [branche, setBranche] = useState('');
  const [description, setDescription] = useState('');
  const [showCityInput, setShowCityInput] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [showJobStatus, setShowJobStatus] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDomain = domain.trim();
    if (trimmedDomain) {
      setDomain(trimmedDomain);
      setShowCityInput(true);
      console.log('Domain submitted:', trimmedDomain);
    }
  };

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setCities([]);
      return;
    }

    setLoading(true);
    try {
      // Search by city name first
      const response = await axios.get(
        `https://api.zippopotam.us/search/DE/${query}`
      );

      if (response.data && response.data.places) {
        const cityResults = response.data.places.map((place: ZippopotamPlace) => ({
          name: place['place name'],
          postcode: place['post code'],
          country: 'Germany'
        }));

        // Group by city name and show multiple postal codes for the same city
        const cityGroups = cityResults.reduce((acc: City[], city: City) => {
          const existingCity = acc.find((c: City) => c.name.toLowerCase() === city.name.toLowerCase());
          if (existingCity) {
            // If city exists but with different postal code, create a separate entry
            if (existingCity.postcode !== city.postcode) {
              acc.push(city);
            }
          } else {
            acc.push(city);
          }
          return acc;
        }, [] as City[]);

        setCities(cityGroups.slice(0, 8)); // Show more results to include different postal codes
      } else {
        // If no results found, try searching for postal codes that might match
        try {
          const postalResponse = await axios.get(
            `https://api.zippopotam.us/DE/${query}`
          );
          if (postalResponse.data && postalResponse.data.places) {
            const postalData = postalResponse.data as ZippopotamResponse;
            const postalResults = postalData.places.map((place) => ({
              name: place['place name'],
              postcode: postalData['post code'],
              country: 'Germany'
            }));
            setCities(postalResults.slice(0, 5));
          } else {
            setCities([
              { name: query, postcode: '00000', country: 'Germany' }
            ]);
          }
        } catch {
          setCities([
            { name: query, postcode: '00000', country: 'Germany' }
          ]);
        }
      }
    } catch {
      // If city search fails, try as postal code
      try {
        const postalResponse = await axios.get(
          `https://api.zippopotam.us/DE/${query}`
        );
        if (postalResponse.data && postalResponse.data.places) {
          const postalData = postalResponse.data as ZippopotamResponse;
          const postalResults = postalData.places.map((place) => ({
            name: place['place name'],
            postcode: postalData['post code'],
            country: 'Germany'
          }));
          setCities(postalResults.slice(0, 5));
        } else {
          setCities([
            { name: query, postcode: '00000', country: 'Germany' }
          ]);
        }
      } catch {
        setCities([
          { name: query, postcode: '00000', country: 'Germany' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityQuery(value);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      searchCities(value);
    }, 300); // 300ms debounce

    setSearchTimeout(newTimeout);
  };

  const handleCitySelect = (city: City) => {
    if (!selectedCities.find(c => c.name === city.name && c.postcode === city.postcode)) {
      setSelectedCities([...selectedCities, city]);
    }
    setCityQuery('');
    setCities([]);
  };

  const removeCitySelection = (cityToRemove: City) => {
    setSelectedCities(selectedCities.filter(c => !(c.name === cityToRemove.name && c.postcode === cityToRemove.postcode)));
  };

  const pollJobStatus = async (jobId: string) => {
    const maxAttempts = 60; // Poll for max 5 minutes (60 * 5 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        console.log(`Polling job status, attempt ${attempts}/${maxAttempts}`);

        const response = await axios.get(`/api/job-data?job_id=${jobId}`);

        if (response.data.success && (response.data.data.status === 'completed' || response.data.data.status === 'completeted')) {
          // Job completed, show success message for 7 seconds then redirect
          setJobStatus({
            job_id: jobId,
            status: 'success',
            message: 'Subpages generated successfully! Redirecting to download page...'
          });

          // Redirect after 7 seconds
          setTimeout(() => {
            setShowJobStatus(false);
            router.push(`/success?job_id=${jobId}`);
          }, 7000);
          return;
        } else if (response.data.data?.status === 'failed' || response.data.data?.status === 'error') {
          // Job failed
          setJobStatus({
            job_id: jobId,
            status: 'error',
            message: 'Failed to generate subpage. Please try again.'
          });
          return;
        }

        // Still pending, continue polling
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          // Max attempts reached
          setJobStatus({
            job_id: jobId,
            status: 'error',
            message: 'Timeout: Subpage generation took too long. Please try again.'
          });
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Retry on error
        } else {
          setJobStatus({
            job_id: jobId,
            status: 'error',
            message: 'Error checking job status. Please try again.'
          });
        }
      }
    };

    // Start polling after 3 seconds initial delay
    setTimeout(poll, 3000);
  };

  const handleCreateSubpage = async () => {
  const trimmedDomain = domain.trim();

  // Ensure domain has https:// prefix
  const fullDomain = trimmedDomain.startsWith('http://') || trimmedDomain.startsWith('https://')
    ? trimmedDomain
    : `https://${trimmedDomain}`;

  if (selectedCities.length === 0) {
    alert('Please select at least one city first');
    return;
  }

  if (!trimmedDomain) {
    alert('Domain is missing. Please refresh and try again.');
    return;
  }

  const job_id = Date.now().toString();

  const payload = {
    job_id,
    domain: fullDomain,
    branche: branche.trim() || undefined,
    description: description.trim() || undefined,
    cities: selectedCities.map(city => ({
      name: city.name,
      postcode: city.postcode || '00000',
      country: city.country || 'Germany'
    }))
  };

  console.log('Starting subpage creation, payload:', payload);

  setIsSubmitting(true);
  try {
    // 🔑 Send directly to your Workflow A Webhook (Production URL, not /api/job-data!)
    const response = await axios.post(
      'https://aionitasde.app.n8n.cloud/webhook/generate-job', // Fixed URL to match n8n workflow
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
      }
    );

    console.log('Webhook response:', response.data);

    // Show pending status popup
    setJobStatus({
      job_id,
      status: 'pending',
      message: 'Job created successfully. AI is generating your subpages...'
    });
    setShowJobStatus(true);

    // Start polling job-data API for completion
    pollJobStatus(job_id);

  } catch (error) {
    console.error('Error sending to n8n webhook:', error);
    alert('❌ Failed to start job. Please check the Webhook URL and try again.');
  } finally {
    setIsSubmitting(false);
  }
};


  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Enhanced Header with Neon Effects */}
          <div className={`text-center mb-16 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-none mb-6 transform rotate-45 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300">
              <div className="transform -rotate-45">
                <BuildingOfficeIcon className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl">
              Subpage Generator
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto mb-6 shadow-lg shadow-cyan-500/50"></div>
            <p className="text-xl text-slate-300 max-w-lg mx-auto leading-relaxed">
              Create professional subpages for your business with intelligent location targeting
            </p>
          </div>

          {/* Enhanced Domain Input Section */}
          <div className={`mb-8 transition-all duration-500 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="bg-slate-800/90 backdrop-blur-sm border-2 border-cyan-500 p-8 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:border-cyan-400 transition-all duration-300 relative overflow-hidden">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 pointer-events-none"></div>
              <div className="relative z-10">
              <form onSubmit={handleDomainSubmit} className="space-y-6">
                <div>
                  <label htmlFor="domain" className="block text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">
                    Domain <span className="text-cyan-300">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="domain"
                      required
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="yourcompany.com"
                      className="w-full px-4 py-4 bg-slate-900/80 backdrop-blur-sm border-2 border-slate-700 focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/20 transition-all duration-300 text-white placeholder-slate-400 font-mono hover:border-slate-600"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <MagnifyingGlassIcon className="h-5 w-5 text-cyan-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="branche" className="block text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">
                    Branche
                  </label>
                  <input
                    type="text"
                    id="branche"
                    value={branche}
                    onChange={(e) => setBranche(e.target.value)}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    className="w-full px-4 py-4 bg-slate-900/80 backdrop-blur-sm border-2 border-slate-700 focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/20 transition-all duration-300 text-white placeholder-slate-400 font-mono hover:border-slate-600"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 255))}
                      placeholder="Brief description of your business (max 255 characters)"
                      maxLength={255}
                      rows={3}
                      className="w-full px-4 py-4 bg-slate-900/80 backdrop-blur-sm border-2 border-slate-700 focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/20 transition-all duration-300 text-white placeholder-slate-400 font-mono resize-none hover:border-slate-600"
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                      {description.length}/255
                    </div>
                  </div>
                </div>

                {!showCityInput && (
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-900 font-bold py-4 px-6 transition-all duration-300 uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transform"
                  >
                    Continue to Location
                  </button>
                )}
              </form>
              </div>
            </div>
          </div>

          {/* Enhanced City Input Section */}
          {showCityInput && (
            <div className="mb-8 animate-in slide-in-from-bottom duration-500">
              <div className="bg-slate-800/90 backdrop-blur-sm border-2 border-cyan-500 p-8 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:border-cyan-400 transition-all duration-300 relative overflow-hidden">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 pointer-events-none"></div>
                <div className="relative z-10">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">
                      Target Location
                    </label>
                    <p className="text-slate-400 text-sm mb-4">
                      Type a city name to automatically find postal codes, or enter a specific postal code
                    </p>
                    <div className="relative">
                      <input
                        type="text"
                        id="city"
                        value={cityQuery}
                        onChange={handleCityInputChange}
                        placeholder="e.g., Berlin, Hamburg, or 10115"
                        className="w-full px-4 py-4 bg-slate-900/80 backdrop-blur-sm border-2 border-slate-700 focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/20 transition-all duration-300 text-white placeholder-slate-400 font-mono hover:border-slate-600"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <MapPinIcon className="h-5 w-5 text-cyan-500" />
                        )}
                      </div>
                    </div>

                    {/* Enhanced City Results */}
                    {cities.length > 0 && (
                      <div className="mt-4">
                        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 shadow-lg shadow-cyan-500/10 overflow-hidden">
                          {cities.map((city, index) => (
                            <div
                              key={`${city.name}-${city.postcode}-${index}`}
                              onClick={() => handleCitySelect(city)}
                              className="px-4 py-3 hover:bg-slate-800/80 cursor-pointer border-b border-slate-700 last:border-b-0 transition-all duration-300 group hover:shadow-inner hover:shadow-cyan-500/10"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                                    {city.name}
                                  </div>
                                  {city.postcode && (
                                    <div className="text-cyan-400 text-sm mt-1 font-mono">
                                      {city.postcode}
                                    </div>
                                  )}
                                  <div className="text-slate-400 text-xs mt-1 uppercase tracking-wider">
                                    {city.country}
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <div className="w-6 h-6 bg-cyan-500 flex items-center justify-center">
                                    <span className="text-slate-900 text-xs font-bold">+</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selected Cities Display */}
                    {selectedCities.length > 0 && (
                      <div className="mt-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-slate-700 border-2 border-cyan-500 p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <MapPinIcon className="w-5 h-5 text-cyan-400" />
                            <div className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                              Selected Locations ({selectedCities.length})
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedCities.map((city) => (
                              <div key={`${city.name}-${city.postcode}`} className="group bg-slate-900 p-3 border border-slate-600 hover:border-cyan-500 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-bold text-white">{city.name}</div>
                                    {city.postcode && (
                                      <div className="text-cyan-400 text-sm font-mono">{city.postcode}</div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeCitySelection(city)}
                                    className="opacity-0 group-hover:opacity-100 w-5 h-5 bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all duration-200 text-white text-xs font-bold"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Subpage Button */}
          {selectedCities.length > 0 && (
            <div className="text-center animate-in slide-in-from-bottom duration-500 delay-200">
              <button
                onClick={handleCreateSubpage}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-700 text-slate-900 disabled:text-slate-400 font-bold px-12 py-4 transition-all duration-300 disabled:cursor-not-allowed uppercase tracking-wider text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transform disabled:transform-none disabled:shadow-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <span>Generate Subpage</span>
                )}
              </button>
            </div>
          )}

          {/* Enhanced Project Summary */}
          {selectedCities.length > 0 && (
            <div className="mt-8 animate-in slide-in-from-bottom duration-500 delay-300">
              <div className="bg-slate-800/90 backdrop-blur-sm border-2 border-cyan-500 p-8 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/30 relative overflow-hidden">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none"></div>
                <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center uppercase tracking-wider">
                  <BuildingOfficeIcon className="w-5 h-5 mr-3 text-cyan-400" />
                  Project Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 border border-slate-700">
                    <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider">Domain</div>
                    <div className="text-white font-mono mt-1">
                      {domain.startsWith('http://') || domain.startsWith('https://') ? domain : `https://${domain}`}
                    </div>
                  </div>
                  {branche && (
                    <div className="p-4 bg-slate-900 border border-slate-700">
                      <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider">Branche</div>
                      <div className="text-white font-mono mt-1">{branche}</div>
                    </div>
                  )}
                  {description && (
                    <div className={`p-4 bg-slate-900 border border-slate-700 ${branche ? 'md:col-span-2' : 'md:col-span-1'}`}>
                      <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider">Description</div>
                      <div className="text-white mt-1">{description}</div>
                    </div>
                  )}
                  <div className={`p-4 bg-slate-900 border border-slate-700 ${!branche && !description ? 'md:col-span-1' : 'md:col-span-2'}`}>
                    <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider">Locations ({selectedCities.length})</div>
                    <div className="space-y-1 mt-1">
                      {selectedCities.map((city) => (
                        <div key={`${city.name}-${city.postcode}`} className="text-white font-bold">
                          {city.name}{city.postcode ? ` (${city.postcode})` : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-900 shadow-lg shadow-cyan-500/30">
                    <div className="w-2 h-2 bg-slate-900 mr-2 animate-pulse"></div>
                    <span className="font-bold text-sm uppercase tracking-wider">Ready to Deploy</span>
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Job Status Popup */}
          {showJobStatus && jobStatus && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
              <div className="bg-slate-800/95 backdrop-blur-sm border-2 border-cyan-500 p-8 max-w-md w-full mx-4 shadow-2xl shadow-cyan-500/30 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 pointer-events-none"></div>
                <div className="relative z-10">
                <div className="text-center">
                  {/* Status Icon */}
                  <div className="mb-6">
                    {jobStatus.status === 'pending' ? (
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full shadow-lg shadow-cyan-500/50">
                        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : jobStatus.status === 'success' ? (
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/50">
                        <div className="w-8 h-8 text-white font-bold text-2xl">✓</div>
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/50">
                        <div className="w-8 h-8 text-white font-bold text-2xl">✗</div>
                      </div>
                    )}
                  </div>

                  {/* Job Status Content */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">
                      {jobStatus.status === 'pending' ? 'Processing Job' :
                       jobStatus.status === 'success' ? 'Job Created' : 'Job Status'}
                    </h3>
                    <p className="text-slate-300 mb-4">{jobStatus.message}</p>

                    {/* Job ID */}
                    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 p-3 mb-4 shadow-inner shadow-cyan-500/10">
                      <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-1">Job ID</div>
                      <div className="text-white font-mono text-sm">{jobStatus.job_id}</div>
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center px-4 py-2 ${
                      jobStatus.status === 'pending' ? 'bg-cyan-500 text-slate-900' :
                      jobStatus.status === 'success' ? 'bg-green-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      <div className={`w-2 h-2 ${
                        jobStatus.status === 'pending' ? 'bg-slate-900' :
                        'bg-white'
                      } mr-2 ${jobStatus.status === 'pending' ? 'animate-pulse' : ''}`}></div>
                      <span className="font-bold text-sm uppercase tracking-wider">
                        {jobStatus.status}
                      </span>
                    </div>
                  </div>

                  {/* Close Button */}
                  {jobStatus.status !== 'pending' && (
                    <button
                      onClick={() => setShowJobStatus(false)}
                      className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold py-3 px-6 transition-all duration-300 uppercase tracking-wider shadow-lg hover:shadow-slate-500/20 hover:scale-105 transform"
                    >
                      Close
                    </button>
                  )}

                  {/* Auto-close message for pending status */}
                  {jobStatus.status === 'pending' && (
                    <div className="text-slate-400 text-sm mt-4">
                      This window will update automatically when processing completes
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}