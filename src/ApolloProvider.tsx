import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  ApolloProvider as Provider,
  split,
} from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { useAuthState } from "@/state";

// only on dev mode
if (process.env.NODE_ENV === "development") {
  loadDevMessages();
  loadErrorMessages();
}

// HTTP Link
const httpLink = new HttpLink({
  uri: process.env.VITE_GRAPHQL_URL
    ? process.env.VITE_GRAPHQL_URL
    : "http://localhost:8080/v1/graphql",
});

// WebSocket Link
const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.VITE_WEBSOCKET_URL
      ? process.env.VITE_WEBSOCKET_URL
      : "ws://localhost:8080/v1/graphql",
    connectionParams: () => ({
      headers: {
        Authorization: `Bearer `,
      },
    }),
    lazy: true,
  })
);

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const ApolloProvider = (props: { children: any }) => {
  // auth event listener handler
  const { setIsAuthenticated } = useAuthState();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const client = useMemo(() => {
    const authLink = new ApolloLink((operation, forward) => {
      // Only add the Authorization header if a token is available
      //
      // This is to prevent the header from being sent when the user is not authenticated
      // This is important because hasura expects an authorization header in correct format
      // and will return an error if the header is sent without a token (ex: "Bearer null" or "Bearer undefined" or "")
      // when doing `referrerLogin` mutation
      if (accessToken) {
        operation.setContext({
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
      return forward(operation);
    });

    return new ApolloClient({
      link: authLink.concat(link),
      cache: new InMemoryCache(),
    });
  }, [accessToken]);

  return <Provider client={client}>{props.children}</Provider>;
};
