import { Header } from "@/components/header";

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center size-full snap-y snap-mandatory overflow-y-auto">
      <Header />
      <div className="w-full px-4 md:px-6 mb-4">
        {children}
      </div>
    </div>
  );
}


