"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowDownTrayIcon, HomeIcon } from "@heroicons/react/24/outline";

interface SubpageData {
  job_id: string;
  city: string | null;
  content: string;
  domain: string;
  cities: { name: string; postcode?: string; country?: string }[];
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [subpages, setSubpages] = useState<SubpageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      const jobId = searchParams.get("job_id");
      if (!jobId) {
        router.push("/");
        return;
      }

      try {
        const response = await fetch(`/api/job-data?job_id=${jobId}`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
          setSubpages(result.data);
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error fetching job data:", err);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [searchParams, router]);

  const downloadTsxFile = (subpage: SubpageData) => {
    const tsxContent = convertHtmlToTsx(
      subpage.content,
      subpage.city || "Generated Location",
      subpage.domain
    );

    const blob = new Blob([tsxContent], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(subpage.city || "city")
      .toLowerCase()
      .replace(/\s+/g, "-")}-subpage.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertHtmlToTsx = (htmlContent: string, city: string, domain: string) => {
    let cleanContent = htmlContent
      .replace(/```html\n?/g, "")
      .replace(/\n?```/g, "");

    const bodyMatch = cleanContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) cleanContent = bodyMatch[1];

    const tsxContent = cleanContent
      .replace(/\[object Object\]/g, city)
      .replace(/class=/g, "className=")
      .replace(/for=/g, "htmlFor=")
      .replace(/<meta([^>]*?)>/g, "<meta$1 />")
      .replace(/<link([^>]*?)>/g, "<link$1 />")
      .replace(/<input([^>]*?)>/g, "<input$1 />")
      .replace(/<img([^>]*?)>/g, "<img$1 />")
      .replace(/<br>/g, "<br />")
      .replace(/<hr>/g, "<hr />");

    const componentName =
      city.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "") + "Subpage";

    return `import React from 'react';

export default function ${componentName}() {
  return (
    <>
      ${tsxContent}
    </>
  );
}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (subpages.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Subpages Generated!</h1>

      <div className="space-y-6">
        {subpages.map((subpage) => (
          <div
            key={subpage.job_id + subpage.city}
            className="bg-slate-800 border border-cyan-500 p-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              Subpage for {subpage.city}
            </h2>
            <button
              onClick={() => downloadTsxFile(subpage)}
              className="inline-flex items-center bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 mr-3"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Download
            </button>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Create Another
            </button>

            <div
              className="mt-6 text-cyan-400"
              dangerouslySetInnerHTML={{ __html: subpage.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}