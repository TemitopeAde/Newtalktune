import { useEffect, useState } from "react";
import { getCountryCallingCode, isSupportedCountry } from "libphonenumber-js";

interface Country {
  name: string;
  code: string;
  dial_code: string;
}

export const useCountries = () => {
  const [data, setData] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Only need name + cca2; dial codes come from libphonenumber-js
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2",
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`Failed to load countries (${res.status})`);
        const json: Array<{
          name?: { common?: string };
          cca2?: string;
        }> = await res.json();

        const countries: Country[] = json
          .map((c) => {
            const name = c.name?.common?.trim();
            const code = c.cca2?.trim();
            if (!name || !code) return null;

            // Use libphonenumber-js as the authoritative source for calling codes.
            // This is the same library used for phone validation, so the codes
            // are always consistent (e.g. US → +1, AS → +1684, GU → +1671).
            if (!isSupportedCountry(code as any)) return null;
            const callingCode = getCountryCallingCode(code as any);
            const dial_code = `+${callingCode}`;

            return { name, code, dial_code } as Country;
          })
          .filter(Boolean) as Country[];

        countries.sort((a, b) => a.name.localeCompare(b.name));
        setData(countries);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          // Fallback to minimal list if API fails
          setData([
            { name: "United States", code: "US", dial_code: "+1" },
            { name: "United Kingdom", code: "GB", dial_code: "+44" },
          ]);
          setError(e?.message || "Failed to load countries");
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  return { data, isLoading, error } as const;
};
