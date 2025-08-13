import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center size-full">
      <Header />
      {children}
      <Footer />
    </div>
  );
}