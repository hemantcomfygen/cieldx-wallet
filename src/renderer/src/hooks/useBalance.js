import { useEffect, useState } from "react";
import { getBalance } from "../adapters/passphraseAdapter";

export const useBalance = ({ address, token }) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address || !token) return;

    const fetchBalance = async () => {
      try {
        setLoading(true);
        const bal = await getBalance({ address, token });
        setBalance(bal);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [address, token]);

  return { balance, loading };
};