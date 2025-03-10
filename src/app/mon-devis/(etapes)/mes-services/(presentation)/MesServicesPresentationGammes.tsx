import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

const MesServicesPresentationGammes = () => {
  return (
    <div className="flex-wrap gap-10 justify-center text-2xl mb-4 hidden lg:flex">
      <div
        className={`flex gap-2 w-48  px-6 py-10 bg-fm4allessential rounded-lg text-slate-200 font-bold justify-center`}
      >
        <p>Essentiel</p>
        <Dialog>
          <DialogTrigger asChild>
            <Info
              size={16}
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                <p className={`text-fm4allessential text-center`}>Essentiel</p>
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col text-base my-4 hyphens-auto">
              Vous êtes en recherche de services efficaces et optimisés. Ce qui
              est important pour vous c&apos;est d&apos;être en règle et
              d&apos;apporter ce qui est essentiel pour votre site.
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div
        className={`flex gap-2 w-48  px-6 py-10 bg-fm4allcomfort rounded-lg text-slate-200 font-bold justify-center`}
      >
        <p>Confort</p>
        <Dialog>
          <DialogTrigger asChild>
            <Info
              size={16}
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                <p className={`text-fm4allcomfort text-center`}>Confort</p>
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col text-base my-4 hyphens-auto">
              Vous êtes en recherche du bon rapport qualité prix. Le strict
              minimum vous semble un peu juste pour cette prestation et vous
              cherchez le bon équilibre. Dans cette formule, tout est géré clé
              en main, sans contraintes.
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div
        className={`flex gap-2 w-48  px-6 py-10 bg-fm4allexcellence rounded-lg text-slate-200 font-bold justify-center`}
      >
        <p>Excellence</p>
        <Dialog>
          <DialogTrigger asChild>
            <Info
              size={16}
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                <p className={`text-fm4allexcellence text-center`}>
                  Excellence
                </p>
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col text-base my-4 hyphens-auto">
              Le bien être au travail, c&apos;est important. Vous investissez
              sur les services envers vos collaborateurs, car ils vous le
              rendent bien. L&apos;excellence de service vous donne tranquillité
              d&apos;esprit.
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MesServicesPresentationGammes;
