import MonDevisDocument from "./MonDevisDocument";
import MonDevisForm from "./MonDevisForm";

const MonDevis = () => {
  return (
    <section className="flex-1 overflow-hidden">
      <MonDevisForm />
      <MonDevisDocument />
    </section>
  );
};

export default MonDevis;
