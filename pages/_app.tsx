import { useState } from "react";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme={"dark"}>
        <Component {...pageProps} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
