import { ScheduleBuilder } from "@/components/ScheduleBuilder";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Schedule Builder - CySearch",
  description: "Build and plan your class schedule at Iowa State University",
};

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-12 py-8 w-full">
        <ScheduleBuilder />
      </main>
      <Footer />
    </div>
  );
}
