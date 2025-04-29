import { KeyboardEvent, useRef } from "react";

interface InputOTPProps {
  value: string[];
  onChange: (value: string[]) => void;
  length?: number;
}

export function InputOTP({ value, onChange, length = 6 }: InputOTPProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (isNaN(Number(digit))) return;

    const newValue = [...value];
    newValue[index] = digit;
    onChange(newValue);

    if (digit !== "" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && value[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    const numbers = pastedData.match(/\d/g);
    if (!numbers) return;

    const newValue = [...value];
    numbers.forEach((num, idx) => {
      if (idx + index < length) {
        newValue[idx + index] = num;
      }
    });
    onChange(newValue);

    const nextEmptyIndex = newValue.findIndex((val) => val === "");
    if (nextEmptyIndex !== -1 && nextEmptyIndex < length) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-between w-full">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          // type="text"
          type="number"
          maxLength={1}
          value={value[index]}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(e, index)}
          className="w-12 h-12 md:w-16 md:h-16 text-center border rounded-md text-lg focus:border-blue-500 focus:outline-none font-bold text-neutral-900"
        />
      ))}
    </div>
  );
}
