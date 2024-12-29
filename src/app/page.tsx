import Articles from "./Articles";
import Hero from "./Hero";
import HofManager from "./HofManager";
import How from "./How";
import Mission from "./Mission";
import Presentation from "./Presentation";
import Services from "./Services";
import VideoPresentation from "./VideoPresentation";
import Why from "./Why";

export default function page() {
  return (
    <main className="flex flex-col gap-12">
      <Hero />
      <Presentation />
      <VideoPresentation />
      <How />
      <Why />
      <Services />
      <Mission />
      <HofManager />
      <Articles />
    </main>
  );
}
