// Test content Preview
// Todo:
// 1. Get content from Builder.io
// 
import { Content } from '@builder.io/sdk-react/edge';
import { useSearchParams } from '@remix-run/react';

const apiKey = '5cf7a555e45f40e4ab9cb3a6e57594ad';

export default function BuilderPreview() {
  const [searchParams] = useSearchParams();
  const model = searchParams.get('headless-page') || 'page';

  return (
    <>
      <builder-component model={model} api-key={apiKey}>
        <Content model={model} apiKey={apiKey} />
      </builder-component>
      <script async src="https://cdn.builder.io/js/webcomponents"></script>
    </>
  );
}
