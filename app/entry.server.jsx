import { RemixServer } from '@remix-run/react';
import isbot from 'isbot';
import { renderToReadableStream, renderToString } from 'react-dom/server';
import { createContentSecurityPolicy } from '@shopify/hydrogen';

// Function to generate a secure nonce
const generateNonce = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array));
};

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
  // Generate a nonce
  const nonce = generateNonce();

  const { header, NonceProvider } = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", 'https://cdn.builder.io', 'https://cdn.shopify.com'],
    imgSrc: ['https://cdn.builder.io', 'https://cdn.shopify.com'],
    scriptSrcElem: [
      "'self'",
      'https://cdn.builder.io',
      'https://cdn.shopify.com',
      `'nonce-${nonce}'`, // Correct nonce usage
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

  // Create a HTML template with nonce for inline scripts
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <script nonce="${nonce}">/* Your inline script here */</script>
      </head>
      <body>
        <!-- Your body content here -->
      </body>
    </html>
  `;

  return new Response(htmlTemplate, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/remix-oxygen').EntryContext} EntryContext */
/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
