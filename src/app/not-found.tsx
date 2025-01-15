import BackButton from "@/components/back-button";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center max-w-80 mx-auto h-dvh">
      <div className="flex flex-col gap-2 mt-4">
        <h2 className="font-bold text-lg text-center">Page non trouvée !</h2>
        <BackButton
          title="Retour"
          size="lg"
          variant="outline"
          className="text-base"
        />
      </div>
    </div>
  );
}
