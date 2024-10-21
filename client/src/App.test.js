// client/src/App.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient();

test('renders HomePage component', async () => {
  const { getByText } = render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );

  // Check if the HomePage component is rendered
  expect(getByText("Loading...")).toBeInTheDocument();
});