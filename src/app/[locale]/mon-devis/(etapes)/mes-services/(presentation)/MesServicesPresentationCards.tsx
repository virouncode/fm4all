import {
  SprayCan,
  Toilet,
  Wrench,
  FireExtinguisher,
  Coffee,
  Leaf,
  Cookie,
  Banana,
  CupSoda,
  UserRoundCog,
} from "lucide-react";

const MesServicesPresentationCards = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-center">
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <SprayCan />
        </div>
        <p>Nettoyage et propreté</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <Toilet />
        </div>
        <p>Hygiène sanitaire</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <Wrench />
        </div>
        <p>Maintenance</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <FireExtinguisher />
        </div>
        <p>Sécurité incendie</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <Coffee />
        </div>
        <p>Boissons chaudes</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <Leaf />
        </div>
        <p>Thés variés</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <Cookie />
          <Banana />
          <CupSoda />
        </div>
        <p>Snacks & Fruits</p>
      </div>
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <UserRoundCog />
        </div>
        <p>Office/Hospitality Manager</p>
      </div>
      {/* <div className="flex gap-4 items-center p-4 border rounded-xl">
              <div className="flex items-center gap-1">
                <HandPlatter />
              </div>
              <p>Services fm4all</p>
            </div> */}
    </div>
  );
};

export default MesServicesPresentationCards;
