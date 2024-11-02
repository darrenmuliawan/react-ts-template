import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ApolloProvider } from "./ApolloProvider";
import { Layout } from "./layout/Layout";

export const App = () => {
  return (
    <ApolloProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<div>Home</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
};
