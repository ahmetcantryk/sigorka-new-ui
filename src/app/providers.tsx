'use client';

import { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from '../apollo/client';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
} 