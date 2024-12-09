// ($slug)._index.tsx
import {
  Content,
  BuilderContent,
  fetchOneEntry,
  getBuilderSearchParams,
  isPreviewing,
// } from '@builder.io/sdk-react';
} from '@builder.io/sdk-react/edge';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React from 'react';
// const apiKey = "process.env.BUILDER_IO_API_KEY";
// const apiKey = process.env.BUILDER_IO_API_KEY || '5cf7a555e45f40e4ab9cb3a6e57594ad';
const apiKey = '5cf7a555e45f40e4ab9cb3a6e57594ad';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	try {
	  const url = new URL(request.url);
	  const urlPath = `/${params['slug'] || ''}`;
  
	  // Debug logs
	  console.log('🔑 API Key:', apiKey);
	  console.log('🌐 URL Path:', urlPath);
	  
	  const page = await fetchOneEntry({
		model: 'headless-page',
		apiKey,
		options: {
        ...getBuilderSearchParams(url.searchParams),
        includeUnpublished: isPreviewing // Enable draft content in preview
      	},
		userAttributes: { urlPath }
	  });
	return { page, isPreviewing };
	  
	} catch (error) {
	  console.error('❌ Error:', error);
	  throw new Response('Error fetching page', {
		status: 500,
		statusText: 'Error fetching page from Builder.io',
	  });
	}
  };

// Define and render the page.
// export default function Page() {
  // Use the useLoaderData hook to get the Page data from `loader` above.
//   const { page } = useLoaderData<typeof loader>();

  // Render the page content from Builder.io
//   return <Content model="headless-page" apiKey={apiKey} content={page} />;
// return <Content model="headless-page" apiKey={apiKey} content={page as BuilderContent} />;
export default function Page() {
	const { page } = useLoaderData<typeof loader>();
	  
	// Add debug console logs
	console.log('Page data:', page);
	console.log('Page type:', typeof page);
	console.log('Is page null?', page === null);
	console.log('Page structure:', JSON.stringify(page, null, 2));
  
  
	if (!page || !page.data) {
		return <div>No page content available</div>;
	  }
	
	  // Check if the necessary properties exist
	  if (!page.data.title || !page.data.blocks) {
		return <div>Incomplete page content</div>;
	  }
	
  
	// Render the page content from Builder.io
	// default way
	// return <Content model="headless-page" apiKey={apiKey} content={page} />;

	// Test call page as BuilderContent
	return <Content model="headless-page" apiKey={apiKey} content={page as BuilderContent} />;

  	// Render the page content from Builder.io using components test
	// return <Content model="headless-page" apiKey={apiKey} content={page} linkComponent={LinkComponent} />;
}