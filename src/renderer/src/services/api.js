import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});


export const getTokens = async () => {
  const res = await fetch(
    "https://api.bridgers.xyz/api/exchangeRecord/getToken",
    {
      method: "POST",
    }
  );

  const data = await res.json();
  return data.data.tokens;
};

export const getQuote = (data) => API.post("/swap/quote", data);