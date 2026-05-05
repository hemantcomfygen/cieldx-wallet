import React, { useEffect, useRef, useState } from "react";

const PasswordInput = ({
  length = 6,
  onChange,
  value="",
  className = "",
}) => {
  const [values, setValues] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

    useEffect(() => {
    if (value === "") {
      setValues(Array(length).fill(""));
      inputsRef.current[0]?.focus();
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    const newValues = [...values];
    newValues[index] = val.slice(-1);
    setValues(newValues);
    onChange?.(newValues.join(""));

    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (values[index]) {
        const newValues = [...values];
        newValues[index] = "";
        setValues(newValues);
        onChange?.(newValues.join(""));
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  return (
    <div className={`flex gap-2 justify-center ${className}`}>
      {values.map((val, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-semibold 
                     bg-zinc-800 text-gray-100 border border-zinc-700 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-green-600 transition-all`}
        />
      ))}
    </div>
  );
};

export default PasswordInput;
