import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';
import sha256 from 'js-sha256';

// Add hash generator function
function generateCSPHash(content) {
  const hash = sha256.create();
  hash.update(content);
  return `'sha256-${hash.hex()}'`;
}

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} remixContext
 * @param {AppLoadContext} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
  context,
) {
  // Get your dynamic script content from RemixServer
  const dynamicContent = await renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );    
  const scriptHash = generateCSPHash(dynamicContent);

  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    defaultSrc: ["'self'"],  // Add this
    connectSrc: ["'self'", 'https://cdn.builder.io', 'https://cdn.shopify.com'],  // Add this
    imgSrc: ['https://cdn.builder.io', 'https://cdn.shopify.com'],
    scriptSrcElem: [
      "'self'",
      'https://cdn.builder.io', 
      'https://cdn.shopify.com',
      scriptHash, // Add dynamic hash
    ],
    styleSrc: ["'self'", "'unsafe-inline'"],
    fontSrc: ['https://fonts.gstatic.com/'], 
  });
  
  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/remix-oxygen').EntryContext} EntryContext */
/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
