import "./globals.css";
import { AppProvider } from "./providers";
import ToastViewport from "@/components/ui/ToastViewport";

export const metadata = {
  title: "NAYSPERA AI — AI Powered Creator System",
  description:
    "NAYSPERA AI is a creator community for discovering, sharing and exploring AI-made art, 3D scenes and visual concepts.",
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23050B19'/%3E%3Cpath d='M20 46 32 18l12 28h-7l-5-13-5 13z' fill='%2308D9E8'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
          <ToastViewport />
        </AppProvider>
      </body>
    </html>
  );
}
