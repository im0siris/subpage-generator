'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircleIcon, ArrowDownTrayIcon, HomeIcon } from '@heroicons/react/24/outline';

interface City {
  name: string;
  postcode?: string;
  country?: string;
}

interface SubpageData {
  city: string;
  content: string;
  domain: string;
  cities: City[];
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subpageData, setSubpageData] = useState<SubpageData | null>(null);
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      const jobId = searchParams.get('job_id');

      if (!jobId) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`/api/job-data?job_id=${jobId}`);
        const data = await response.json();

        if (data.success && data.data.content) {
          setSubpageData({
            city: data.data.city || 'Generated Location',
            content: data.data.content,
            domain: data.data.domain,
            cities: data.data.cities || []
          });
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching job data:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [searchParams, router]);

  const downloadTsxFile = (cityIndex?: number) => {
    if (!subpageData) return;

    if (subpageData.cities.length > 1 && cityIndex !== undefined) {
      // Download specific city file
      const city = subpageData.cities[cityIndex];
      const tsxContent = convertHtmlToTsx(subpageData.content, city.name, subpageData.domain);

      const blob = new Blob([tsxContent], { type: 'text/typescript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${city.name.toLowerCase().replace(/\s+/g, '-')}-subpage.tsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (subpageData.cities.length > 1) {
      // Download all cities as separate files
      downloadAllTsxFiles();
    } else {
      // Legacy single city download
      const tsxContent = convertHtmlToTsx(subpageData.content, subpageData.city, subpageData.domain);

      const blob = new Blob([tsxContent], { type: 'text/typescript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${subpageData.city.toLowerCase().replace(/\s+/g, '-')}-subpage.tsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const downloadAllTsxFiles = () => {
    if (!subpageData || subpageData.cities.length === 0) return;

    subpageData.cities.forEach((city, index) => {
      setTimeout(() => {
        downloadTsxFile(index);
      }, index * 500); // Stagger downloads by 500ms to avoid browser blocking
    });
  };

  const convertHtmlToTsx = (htmlContent: string, city: string, domain: string) => {
    let cleanContent = htmlContent;

    if (cleanContent.includes('```html')) {
      cleanContent = cleanContent.replace(/```html\n?/g, '').replace(/\n?```/g, '');
    }

    const bodyMatch = cleanContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      cleanContent = bodyMatch[1];
    } else {
      cleanContent = cleanContent
        .replace(/<!DOCTYPE[^>]*>/i, '')
        .replace(/<html[^>]*>/i, '')
        .replace(/<\/html>/i, '')
        .replace(/<head>[\s\S]*?<\/head>/i, '')
        .replace(/<body[^>]*>/i, '')
        .replace(/<\/body>/i, '')
        .trim();
    }

    const tsxContent = cleanContent
      .replace(/\[object Object\]/g, city)
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/<meta([^>]*?)>/g, '<meta$1 />')
      .replace(/<link([^>]*?)>/g, '<link$1 />')
      .replace(/<input([^>]*?)>/g, '<input$1 />')
      .replace(/<img([^>]*?)>/g, '<img$1 />')
      .replace(/<br>/g, '<br />')
      .replace(/<hr>/g, '<hr />')
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${');

    const componentName = city.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '') + 'Subpage';

    let title = `IT-Dienstleistungen in ${city} | ${domain.replace('https://', '').replace('http://', '')}`;
    let description = `Entdecken Sie die innovativen IT-Lösungen in ${city}. Steigern Sie die Effizienz Ihres Unternehmens durch maßgeschneiderte Softwareentwicklungen und IT-Beratung.`;

    const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
    const descMatch = htmlContent.match(/<meta[^>]*name=['""]description['""][^>]*content=['""]([^'"]*)['""][^>]*>/i);

    if (titleMatch) title = titleMatch[1].replace(/"/g, '\\"');
    if (descMatch) description = descMatch[1].replace(/"/g, '\\"');

    return `import React from 'react';

interface SubpageProps {
  city?: string;
  domain?: string;
}

export default function ${componentName}({
  city = "${city.replace(/"/g, '\\"')}",
  domain = "${domain.replace(/"/g, '\\"')}"
}: SubpageProps) {
  return (
    <>
      ${tsxContent}
    </>
  );
}

export const metadata = {
  title: "${title}",
  description: "${description}"
};`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!subpageData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
              <CheckCircleIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Subpage Generated Successfully!
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Your AI-powered subpage{subpageData.cities.length > 1 ? 's' : ''} for{' '}
              {subpageData.cities.length > 1 ? (
                <span className="text-cyan-400 font-bold">{subpageData.cities.length} cities</span>
              ) : (
                <span className="text-cyan-400 font-bold">{subpageData.city}</span>
              )}{' '}
              {subpageData.cities.length > 1 ? 'are' : 'is'} ready for download and deployment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => downloadTsxFile()}
              className="inline-flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-4 px-8 transition-colors duration-200 uppercase tracking-wider"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              {subpageData.cities.length > 1 ? 'Download All TSX Files' : 'Download TSX File'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-8 transition-colors duration-200 uppercase tracking-wider"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Create Another
            </button>
          </div>

          <div className="bg-slate-800 border-2 border-cyan-500 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
              Generated Subpage Preview
            </h2>

            {subpageData.cities.length > 1 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-slate-900 border border-slate-700">
                    <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider">Target Cities</div>
                    <div className="text-white font-mono text-lg mt-1">{subpageData.cities.length} cities</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-700">
                    <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider">Domain</div>
                    <div className="text-white font-mono text-lg mt-1">{subpageData.domain}</div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-4">
                    Individual City Downloads
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subpageData.cities.map((city, index) => (
                      <div key={`${city.name}-${city.postcode}`} className="bg-slate-900 border border-slate-700 p-4">
                        <div className="mb-3">
                          <div className="text-white font-bold">{city.name}</div>
                          {city.postcode && (
                            <div className="text-cyan-400 text-sm font-mono">{city.postcode}</div>
                          )}
                        </div>
                        <button
                          onClick={() => downloadTsxFile(index)}
                          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 text-sm transition-colors duration-200 uppercase tracking-wider"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 inline mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-2">
                    Preview Selected City
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subpageData.cities.map((city, index) => (
                      <button
                        key={`${city.name}-${city.postcode}`}
                        onClick={() => setSelectedCityIndex(index)}
                        className={`px-3 py-1 text-sm font-mono transition-colors duration-200 ${
                          selectedCityIndex === index
                            ? 'bg-cyan-500 text-slate-900'
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                        }`}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-900 border border-slate-700">
                  <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider">Target City</div>
                  <div className="text-white font-mono text-lg mt-1">{subpageData.city}</div>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-700">
                  <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider">Domain</div>
                  <div className="text-white font-mono text-lg mt-1">{subpageData.domain}</div>
                </div>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-700 p-6">
              <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-4">
                Generated HTML Content
                {subpageData.cities.length > 1 && (
                  <span className="ml-2 text-xs font-normal">
                    (for {subpageData.cities[selectedCityIndex]?.name || subpageData.city})
                  </span>
                )}
              </div>
              <div className="bg-slate-800 border border-slate-600 p-6 rounded max-h-96 overflow-y-auto">
                <div
                  className="text-cyan-400"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      const currentCity = subpageData.cities.length > 1
                        ? subpageData.cities[selectedCityIndex]?.name || subpageData.city
                        : subpageData.city;

                      const cleanContent = subpageData.content
                        .replace(/```html\n?/g, '')
                        .replace(/\n?```/g, '')
                        .replace(/\[object Object\]/g, currentCity);

                      const bodyMatch = cleanContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                      if (bodyMatch) {
                        return bodyMatch[1];
                      }

                      return cleanContent
                        .replace(/<!DOCTYPE[^>]*>/i, '')
                        .replace(/<html[^>]*>/i, '')
                        .replace(/<\/html>/i, '')
                        .replace(/<head>[\s\S]*?<\/head>/i, '')
                        .replace(/<body[^>]*>/i, '')
                        .replace(/<\/body>/i, '')
                        .trim();
                    })()
                  }}
                />
              </div>
            </div>

            <div className="mt-8 p-6 bg-slate-700 border border-cyan-500">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 uppercase tracking-wider">
                Next Steps
              </h3>
              <div className="space-y-3 text-slate-300">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-500 text-slate-900 font-bold text-sm flex items-center justify-center mt-0.5">1</div>
                  <div>Download the TSX file using the button above</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-500 text-slate-900 font-bold text-sm flex items-center justify-center mt-0.5">2</div>
                  <div>Place the file in your Next.js project&apos;s pages or app directory</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-500 text-slate-900 font-bold text-sm flex items-center justify-center mt-0.5">3</div>
                  <div>Customize the styling and content as needed</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-500 text-slate-900 font-bold text-sm flex items-center justify-center mt-0.5">4</div>
                  <div>Deploy to your domain and start attracting local customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}