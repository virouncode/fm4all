import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";

type CookiesTableProps = {
  cookiesRows: {
    nom: string;
    fournisseur: string;
    finalite: string;
    duree: string;
    type: string;
  }[];
};

const CookiesTable = ({ cookiesRows }: CookiesTableProps) => {
  const t = useTranslations("CookiesPage");
  return (
    <div className="md:3/4 mx-auto flex w-full flex-col gap-2 overflow-x-auto hyphens-auto text-wrap lg:w-2/3">
      <Table>
        <TableCaption>{t("list-des-cookies-utilises")}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{t("nom-du-cookie")}</TableHead>
            <TableHead>{t("nom-du-fournisseur")}</TableHead>
            <TableHead>{t("finalite")}</TableHead>
            <TableHead>{t("duree-de-conservation")}</TableHead>
            <TableHead>{t("type-de-cookie")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cookiesRows.map(({ nom, fournisseur, finalite, duree, type }) => (
            <TableRow key={nom}>
              <TableCell>{nom}</TableCell>
              <TableCell>{fournisseur}</TableCell>
              <TableCell>{finalite}</TableCell>
              <TableCell>{duree}</TableCell>
              <TableCell>{type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CookiesTable;
