import { useEffect, useState } from "react";
import { fetchTokens, normalizeTokens } from "../core/tokenEngine";

export const useTokens = () => {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    (async () => {
      const raw = await fetchTokens();
      setTokens(normalizeTokens(raw));
    })();
  }, []);

  return tokens;
};