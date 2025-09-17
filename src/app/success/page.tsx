'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircleIcon, ArrowDownTrayIcon, HomeIcon } from '@heroicons/react/24/outline';

export const dynamic = "force-dynamic";
interface SubpageData {
  city: string;
  content: string;
  domain: string;
}

export default function Success() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subpageData, setSubpageData] = useState<SubpageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      const jobId = searchParams.get('job_id');

      if (!jobId) {
        // If no job_id, redirect back to home
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
            domain: data.data.domain
          });
        } else {
          // If no data or failed to fetch, redirect back to home
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

  const downloadTsxFile = () => {
    if (!subpageData) return;

    // Convert HTML to TSX format
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
  };

  const convertHtmlToTsx = (htmlContent: string, city: string, domain: string) => {
    // Clean up the HTML content and convert to TSX
    let cleanContent = htmlContent;

    // Remove markdown code blocks if present
    if (cleanContent.includes('```html')) {
      cleanContent = cleanContent.replace(/```html\n?/g, '').replace(/\n?```/g, '');
    }

    // Extract body content only (remove DOCTYPE, html, head tags)
    const bodyMatch = cleanContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      cleanContent = bodyMatch[1];
    } else {
      // If no body tag found, remove DOCTYPE and html wrapper
      cleanContent = cleanContent
        .replace(/<!DOCTYPE[^>]*>/i, '')
        .replace(/<html[^>]*>/i, '')
        .replace(/<\/html>/i, '')
        .replace(/<head>[\s\S]*?<\/head>/i, '')
        .replace(/<body[^>]*>/i, '')
        .replace(/<\/body>/i, '')
        .trim();
    }

    // Clean up the content
    const tsxContent = cleanContent
      // Replace [object Object] with actual city name
      .replace(/\[object Object\]/g, city)
      // Fix HTML attributes for JSX
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      // Convert self-closing tags
      .replace(/<meta([^>]*?)>/g, '<meta$1 />')
      .replace(/<link([^>]*?)>/g, '<link$1 />')
      .replace(/<input([^>]*?)>/g, '<input$1 />')
      .replace(/<img([^>]*?)>/g, '<img$1 />')
      .replace(/<br>/g, '<br />')
      .replace(/<hr>/g, '<hr />')
      // Escape template literals
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${');

    // Create safe component name
    const componentName = city.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '') + 'Subpage';

    // Extract metadata from head if present
    let title = `IT-Dienstleistungen in ${city} | ${domain.replace('https://', '').replace('http://', '')}`;
    let description = `Entdecken Sie die innovativen IT-Lösungen in ${city}. Steigern Sie die Effizienz Ihres Unternehmens durch maßgeschneiderte Softwareentwicklungen und IT-Beratung.`;

    const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
    const descMatch = htmlContent.match(/<meta[^>]*name=['""]description['""][^>]*content=['""]([^'"]*)['""][^>]*>/i);

    if (titleMatch) title = titleMatch[1].replace(/"/g, '\\"');
    if (descMatch) description = descMatch[1].replace(/"/g, '\\"');

    // Create a complete TSX component
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

// Export metadata for Next.js
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
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
              <CheckCircleIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Subpage Generated Successfully!
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Your AI-powered subpage for <span className="text-cyan-400 font-bold">{subpageData.city}</span> is ready for download and deployment.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={downloadTsxFile}
              className="inline-flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-4 px-8 transition-colors duration-200 uppercase tracking-wider"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Download TSX File
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-8 transition-colors duration-200 uppercase tracking-wider"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Create Another
            </button>
          </div>

          {/* Preview Section */}
          <div className="bg-slate-800 border-2 border-cyan-500 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
              Generated Subpage Preview
            </h2>

            {/* Meta Information */}
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

            {/* Content Preview */}
            <div className="bg-slate-900 border border-slate-700 p-6">
              <div className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-4">
                Generated HTML Content
              </div>
              <div className="bg-slate-800 border border-slate-600 p-6 rounded max-h-96 overflow-y-auto">
                <div
                  className="text-cyan-400"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      const cleanContent = subpageData.content
                        .replace(/```html\n?/g, '')
                        .replace(/\n?```/g, '')
                        .replace(/\[object Object\]/g, subpageData.city);

                      // Extract body content for preview
                      const bodyMatch = cleanContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                      if (bodyMatch) {
                        return bodyMatch[1];
                      }

                      // Fallback: remove HTML structure tags
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

            {/* Instructions */}
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