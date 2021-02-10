import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "../pages/index";

describe("App", () => {
  it("renders without crashing", () => {
    const queryClient = new QueryClient();
    const { getByRole } = render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    expect(getByRole("heading", { name: "Welcome to Next.js!" }));
  });
});
