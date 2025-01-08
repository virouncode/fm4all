"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CompanyInfoContext } from "@/context/CompanyInfoProvider";
import { useContext } from "react";
import TotalNettoyage from "./TotalNettoyage";
import TotalProprete from "./TotalProprete";

const Total = () => {
  const { companyInfo } = useContext(CompanyInfoContext);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="text-base absolute top-20 right-10"
        >
          Total
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            <span className="text-2xl">Total </span>{" "}
            <span className="text-sm font-normal">
              ({companyInfo.effectif} personnes, {companyInfo.surface} m
              <sup>2</sup>)
            </span>
          </SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6">
          <TotalNettoyage />
          <TotalProprete />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Total;
