import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [k, setK] = useState<number | "">("");
  const [countries, setCountries] = useState<
    { name: string; capital: string; languages: string[] }[]
  >([]);
  const [allCountries, setAllCountries] = useState<
    {
      name: { common: string };
      cca3?: string;
      capital?: string[];
      languages?: Record<string, string>;
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchWithTimeout = async (url: string, ms = 10000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), ms);
      try {
        const res = await fetch(url, { signal: controller.signal });
        return res;
      } finally {
        clearTimeout(id);
      }
    };

    const fetchCountries = async () => {
      setLoading(true);
      setError("");
      const url =
        "https://restcountries.com/v3.1/all?fields=name,capital,languages";
      try {
        let attempt = 0;
        let lastError: unknown = undefined;
        while (attempt < 2) {
          // 2 attempts
          try {
            const res = await fetchWithTimeout(url, 12000);
            if (!res.ok) {
              if ([429, 500, 502, 503, 504, 400].includes(res.status)) {
                attempt++;
                await new Promise((r) => setTimeout(r, 500 * attempt));
                continue;
              }
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (!Array.isArray(data))
              throw new Error("API did not return an array");
            setAllCountries(data);
            setLoading(false);
            return;
          } catch (err) {
            lastError = err;
            attempt++;
            if (attempt >= 2) throw err;
            await new Promise((r) => setTimeout(r, 500 * attempt));
          }
        }
        throw lastError instanceof Error
          ? lastError
          : new Error("Unknown error");
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(`Failed to fetch countries: ${message}`);
        setAllCountries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (!k) {
      setCountries([]);
      return;
    }
    if (allCountries.length === 0) return;

    const shuffled = [...allCountries].sort(() => 0.5 - Math.random());
    const selected: { name: string; capital: string; languages: string[] }[] =
      shuffled.slice(0, Number(k)).map((c) => ({
        name: String(c?.name?.common ?? "N/A"),
        capital:
          Array.isArray(c?.capital) && c.capital.length > 0
            ? String(c.capital[0])
            : "N/A",
        languages: c?.languages
          ? (Object.values(c.languages) as string[])
          : ["N/A"],
      }));
    setCountries(selected);
  }, [k, allCountries]);

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
        {loading && (
          <p className="mt-2 text-sm text-gray-600">Loading countries…</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-black">
        {countries
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((country) => (
            <div
              key={country.name}
              className="border p-2 rounded shadow-sm bg-white"
            >
              <p>
                <strong>Name:</strong> {country.name}
              </p>
              <p>
                <strong>Capital:</strong> {country.capital}
              </p>
              <p>
                <strong>
                  {country.languages.length === 1 ? "Language" : "Languages"}:
                  <br></br>
                </strong>{" "}
                <ul className="list-disc list-inside">
                  {(country.languages.length > 3
                    ? country.languages.slice(0, 3)
                    : country.languages
                  ).map((lang, index) => (
                    <li key={index}>{lang}</li>
                  ))}
                </ul>
              </p>
            </div>
          ))}
      </div>
    </>
  );
}

export default App;
