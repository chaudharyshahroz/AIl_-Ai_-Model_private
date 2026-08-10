import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
                try {
                  if (localStorage.getItem('reklu-panel-collapsed') === '1') {
                    document.documentElement.classList.add('panel-collapsed');
                  }
                  if (localStorage.getItem('reklu-admin-sidebar-collapsed') === '1') {
                    document.documentElement.classList.add('admin-sidebar-collapsed');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <meta name="theme-color" content="#0f0f0f" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
      </head>
      <body
        className={`${plexSans.variable} ${plexMono.variable} antialiased`}
        suppressHydrationWarning
      >
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
