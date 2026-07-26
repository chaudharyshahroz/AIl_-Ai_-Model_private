import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Reklu — Every leading AI model. One connected workspace.",
    template: "%s · Reklu",
  },
  description:
    "Chat with GPT, Claude, Gemini, Grok, and other leading models. Connect your apps and data, use specialized AI skills, and create documents, presentations, images, spreadsheets, code, and more.",
  applicationName: "Reklu",
  authors: [{ name: "Reklu" }],
  keywords: [
    "AI",
    "ChatGPT",
    "Claude",
    "Gemini",
    "Grok",
    "DeepSeek",
    "Kimi",
    "AI chat",
    "multi-model",
    "MCP",
    "AI workspace",
  ],
  openGraph: {
    type: "website",
    title: "Reklu — Every leading AI model. One connected workspace.",
    description:
      "Chat with leading AI models, connect your apps, and create documents, presentations, images, and more.",
    siteName: "Reklu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reklu — Every leading AI model. One connected workspace.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Pre-paint theme script from next-themes to avoid flash + hydration mismatch */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('reklu-theme');
                  if (!t) t = 'system';
                  var d = t === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t;
                  document.documentElement.classList.add(d);
                  document.documentElement.style.colorScheme = d;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
