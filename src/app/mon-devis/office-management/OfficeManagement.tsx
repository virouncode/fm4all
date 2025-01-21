import OfficeManager from "./(office-management)/OfficeManager";
import ServicesFm4All from "./(services-fm4all)/ServicesFm4All";

const OfficeManagement = () => {
  return (
    <section className="flex-1 overflow-hidden">
      <OfficeManager />
      <ServicesFm4All />
    </section>
  );
};

export default OfficeManagement;
