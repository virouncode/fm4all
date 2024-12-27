import Articles from "./Articles";
import Hero from "./Hero";
import HofManager from "./HofManager";
import Process from "./Process";
import Services from "./Services";
import VideoPresentation from "./VideoPresentation";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <Process />
      <VideoPresentation />
      <Services />
      <HofManager />
      <Articles />
    </main>
  );
}
