import { Quicksand } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const quicksand = Quicksand({ subsets: ["latin"], weight: "400" });

export const metadata = {
  title: "Remy",
  description: "Generate your own step-by-step cooking videos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionChange
        >
          <div className="min-h-screen h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col w-full">
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
