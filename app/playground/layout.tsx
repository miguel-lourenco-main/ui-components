import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center size-full">
      <Header />
      <div className="w-full px-4 md:px-6 my-4">
        {children}
      </div>
      <Footer />
    </div>
  );
}


