import { SelectClientType } from "@/zod-schemas/client";

type ClientFormProps = {
  clients?: SelectClientType[];
};

const ClientForm = ({ clients }: ClientFormProps) => {
  return <div>Client Form</div>;
};

export default ClientForm;
