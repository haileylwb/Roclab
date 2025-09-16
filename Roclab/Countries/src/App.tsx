import { useState } from "react";
import "./App.css";

function App() {
  const [k, setK] = useState<number | "">("");

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw === "") {
      setK("");
      return;
    }

    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      setK(num);
    }
  };

  return (
    <>
      <div className="p-4">
        <input
          type="text"
          value={k}
          onChange={handleOnChange}
          className="border p-2 rounded text-center"
          placeholder="Type a Number (1-10)"
        />
        <p className="mt-2">Displaying: {k}</p>
      </div>
    </>
  );
}

export default App;
