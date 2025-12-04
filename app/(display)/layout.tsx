import { Header } from "@/components/header";

/**
 * Shared layout for the public component gallery routes so they reuse the main header chrome.
 */
export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center size-full">
      <Header />
      {children}
    </div>
  );
}