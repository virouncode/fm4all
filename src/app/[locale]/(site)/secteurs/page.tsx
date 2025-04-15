import { generateAlternates } from "@/lib/metadata-helpers";
import { Metadata } from "next";
import { getLocale } from "next-intl/server";
import SecteursCards from "./SecteursCards";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return generateAlternates(
    "services",
    locale,
    locale === "fr" ? "Nos secteurs d'activité" : "Our business sectors",
    locale === "fr"
      ? "Découvrez nos secteurs d'activité"
      : "Discover our business sectors",
    "/img/services/fm4all.webp"
  );
};

const page = async () => {
  return (
    <main className="max-w-7xl mx-auto mb-24 py-4 px-6 md:px-20">
      <article className="mt-6 flex flex-col gap-10">
        <h1 className="text-4xl">Nos secteurs d&apos;activité</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap text-lg">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Accusantium fuga delectus illo incidunt quasi consequuntur,
              tempore aliquid obcaecati eius ratione, molestias iste sequi
              perspiciatis dolore sint necessitatibus ex autem explicabo.{" "}
              <strong>Esse culpa in fugiat proident veniam cupidatat.</strong>{" "}
              Est nostrud Lorem fugiat consectetur eu incididunt laboris nostrud
              nulla anim pariatur est.{" "}
              <strong>Lorem sunt ad dolor sunt laboris sint occaecat.</strong>{" "}
              Lorem sunt ad dolor sunt laboris sint occaecat.{" "}
              <strong>pilotage</strong> Lorem sunt ad dolor sunt laboris sint
              occaecat.{" "}
              <strong>Lorem sunt ad dolor sunt laboris sint occaecat.</strong>.
            </p>
            <p className="text-center">
              Lorem sunt ad dolor sunt laboris sint occaecat.
            </p>
          </div>
          <SecteursCards />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Est veniam fugiat amet sint ullamco sit aliquip dolor ut.
          </h2>
          <div className="text-lg flex flex-col gap-4 mx-auto w-full max-w-prose hyphens-auto text-wrap">
            <p>
              Consectetur sint dolore esse anim. Sint et voluptate nulla non ex.
              Non adipisicing mollit quis laborum Lorem voluptate. Lorem commodo
              elit nisi laborum id pariatur enim magna adipisicing. Sit magna
              qui in voluptate aute duis nulla reprehenderit eiusmod cupidatat
              qui Lorem in. Sint consectetur ad enim aute ut reprehenderit sint
              nisi aliqua aute irure anim.
            </p>
            <p>
              Nulla sint velit velit aute ullamco adipisicing et exercitation
              laboris esse. Est officia aliqua labore et veniam elit officia qui
              proident laborum elit laborum ullamco. Velit ea sit magna ipsum
              eiusmod aute.{" "}
              <strong>
                Quis sunt ullamco aliqua cillum sit sint nulla sit laborum id et
                ad.
              </strong>{" "}
              Minim fugiat aliqua esse qui nostrud.
            </p>
            <p>
              <strong>
                Quis sunt ullamco aliqua cillum sit sint nulla sit laborum id et
                ad.
              </strong>
              Quis sunt ullamco aliqua cillum sit sint nulla sit laborum id et
              ad.
            </p>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio a
              tenetur quod? Hic inventore, nobis excepturi iure distinctio
              laboriosam soluta ipsa explicabo quibusdam saepe, laudantium
              aliquam neque. Voluptate, earum necessitatibus.{" "}
              <strong>
                Incididunt velit incididunt enim sit ipsum elit minim occaecat
                ea culpa cupidatat.
              </strong>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat
              quibusdam beatae autem officia iure dolorum in tempora nobis cum
              ab, officiis voluptate provident suscipit. Voluptatem voluptas
              sequi quidem eligendi necessitatibus.
            </p>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Vel, ab.
              Optio odit quae perspiciatis natus incidunt eum architecto
              accusantium? Rem beatae quod vitae dolore quisquam inventore quam
              aut ut cumque.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Id cupidatat sunt reprehenderit aliqua commodo qui minim.
          </h2>
          <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
            <p>
              Laborum Lorem officia voluptate irure exercitation aute.{" "}
              <strong>Tempor esse ex quis ullamco.</strong>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laborum
              ratione eum molestiae quaerat deserunt, corrupti ipsa consectetur
              enim. Magnam porro beatae cum, quam adipisci corporis sint totam
              et dolorum facilis.
            </p>
            <p>
              <strong>
                Ad incididunt sit ex est qui eu nisi Lorem aute aute.
              </strong>{" "}
              Aliqua elit reprehenderit do anim non.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="border-l-2 px-4 text-3xl mb-4 ml-6">
            Laboris reprehenderit irure quis enim quis in nulla.
          </h2>
          <div className="text-lg flex flex-col gap-4 w-full mx-auto max-w-prose hyphens-auto text-wrap">
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              Reiciendis deserunt maxime unde vel saepe ipsum reprehenderit
              totam, animi facere quis quia voluptatibus eos architecto veniam
              velit iure cupiditate ipsam a.{" "}
              <strong>
                veniam nisi sit ullamco minim veniam sunt duis anim ex commodo
                ad.
              </strong>{" "}
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
              dolores minus molestiae? Et expedita temporibus totam dolorum
              ipsam consequuntur voluptatem debitis blanditiis corrupti. Alias
              harum temporibus cum! Nisi, autem exercitationem!
            </p>
          </div>
        </div>
      </article>
    </main>
  );
};

export default page;
