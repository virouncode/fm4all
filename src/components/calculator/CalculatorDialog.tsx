"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Check, Copy } from "lucide-react";
import { useState } from "react";

export function CalculatorDialog() {
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const clearDisplay = () => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay("0.");
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = performCalculation();
      setDisplay(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (operator === "+") {
      return firstOperand! + inputValue;
    } else if (operator === "-") {
      return firstOperand! - inputValue;
    } else if (operator === "*") {
      return firstOperand! * inputValue;
    } else if (operator === "/") {
      return firstOperand! / inputValue;
    }

    return inputValue;
  };

  const handleEquals = () => {
    if (!operator || firstOperand === null) return;

    const result = performCalculation();
    setDisplay(String(result));
    setFirstOperand(result);
    setOperator(null);
    setWaitingForSecondOperand(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      toast({
        title: "Copié !",
        description: `${display} a été copié dans le presse-papiers.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier dans le presse-papiers.",
      });
    }
  };

  const CalcButton = ({
    children,
    onClick,
    className = "",
  }: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
  }) => (
    <Button
      variant="outline"
      className={`h-12 w-12 text-lg font-medium ${className}`}
      onClick={onClick}
    >
      {children}
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2">
          <Calculator className="h-4 w-4" />
          <span className="sr-only">Calculatrice</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>Calculatrice</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex h-16 w-full items-center justify-between rounded-md border bg-background px-3 py-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="h-8 w-8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copier</span>
            </Button>
            <div
              className="w-full text-right text-2xl overflow-hidden"
              style={{ textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {display}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <CalcButton onClick={clearDisplay}>C</CalcButton>
            <CalcButton onClick={() => handleOperator("/")}>/</CalcButton>
            <CalcButton onClick={() => handleOperator("*")}>×</CalcButton>
            <CalcButton onClick={() => handleOperator("-")}>-</CalcButton>

            <CalcButton onClick={() => inputDigit("7")}>7</CalcButton>
            <CalcButton onClick={() => inputDigit("8")}>8</CalcButton>
            <CalcButton onClick={() => inputDigit("9")}>9</CalcButton>
            <CalcButton
              onClick={() => handleOperator("+")}
              className="row-span-2"
            >
              +
            </CalcButton>

            <CalcButton onClick={() => inputDigit("4")}>4</CalcButton>
            <CalcButton onClick={() => inputDigit("5")}>5</CalcButton>
            <CalcButton onClick={() => inputDigit("6")}>6</CalcButton>

            <CalcButton onClick={() => inputDigit("1")}>1</CalcButton>
            <CalcButton onClick={() => inputDigit("2")}>2</CalcButton>
            <CalcButton onClick={() => inputDigit("3")}>3</CalcButton>
            <CalcButton onClick={handleEquals} className="row-span-2">
              =
            </CalcButton>

            <CalcButton onClick={() => inputDigit("0")} className="col-span-2">
              0
            </CalcButton>
            <CalcButton onClick={inputDecimal}>.</CalcButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
