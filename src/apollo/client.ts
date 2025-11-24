import { ApolloClient, InMemoryCache, createHttpLink, from, ApolloLink, Observable } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useAuthStore } from '../store/useAuthStore';
import { API_BASE_URL } from '../config/api';

const httpLink = createHttpLink({
  uri: `${API_BASE_URL}/graphql`,
});

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  pendingRequests.forEach((callback) => {
    if (error || !token) {
      callback();
    } else {
      callback();
    }
  });
  pendingRequests = [];
};

async function refreshAuthToken(): Promise<string> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();

  if (!refreshToken) {
    logout();
    throw new Error('Oturum açmanız gerekiyor: Refresh token yok.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/customer/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Token yenileme başarısız: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.accessToken) {
      throw new Error('Geçersiz token yenileme yanıtı.');
    }

    setTokens(data.accessToken, data.refreshToken || refreshToken);
    return data.accessToken;

  } catch (error) {
    logout();
    throw error;
  }
}

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (networkError && 'statusCode' in networkError && networkError.statusCode === 401) {
    if (!isRefreshing) {
      isRefreshing = true;

      return new Observable((observer) => {
        refreshAuthToken()
          .then((newToken) => {
            processQueue(null, newToken);
            forward(operation).subscribe(observer);
          })
          .catch((error) => {
            processQueue(error, null);
            observer.error(error);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    } else {
      return new Observable((observer) => {
        pendingRequests.push(() => {
          forward(operation).subscribe(observer);
        });
      });
    }
  }
});

const authLink = setContext((_, { headers }) => {
  const { accessToken } = useAuthStore.getState();
  return {
    headers: {
      ...headers,
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
