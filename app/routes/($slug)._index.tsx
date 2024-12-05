// ($slug)._index.tsx
import {
  Content,
  fetchOneEntry,
  getBuilderSearchParams,
  isPreviewing,
// } from '@builder.io/sdk-react';
} from '@builder.io/sdk-react/edge';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React from 'react';
import { BuilderContent } from '@builder.io/sdk-react/edge';

// const apiKey = process.env.BUILDER_IO_API_KEY || 'default-api-key';
const apiKey = '5cf7a555e45f40e4ab9cb3a6e57594ad';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	try {
	  const url = new URL(request.url);
	  const urlPath = `/${params['slug'] || ''}`;
  
	  // Debug logs
	  console.log('🔑 API Key:', apiKey);
	  console.log('🌐 URL Path:', urlPath);
	  
	  const page = await fetchOneEntry({
		model: 'page',
		apiKey,
		options: getBuilderSearchParams(url.searchParams),
		userAttributes: { urlPath }
	  });
  
	  // 🎯 Add this return statement
	  return { page };  // This was missing!
	  
	} catch (error) {
	  console.error('❌ Error:', error);
	  throw new Response('Error fetching page', {
		status: 500,
		statusText: 'Error fetching page from Builder.io',
	  });
	}
  };
  
  

// Define and render the page.
export default function Page() {
  // Use the useLoaderData hook to get the Page data from `loader` above.
  const { page } = useLoaderData<typeof loader>();

  // Render the page content from Builder.io
//   return <Content model="page" apiKey={apiKey} content={page} />;
return <Content model="headless-page" apiKey={apiKey} content={page as BuilderContent} />;
}