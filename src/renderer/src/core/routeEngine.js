import { getQuote } from "../services/bridgerService";

export const getBridgerQuote = async (params) => {
  const quote = await getQuote(params);


  console.log("Bridger Quote:", quote);

  // // 🚨 Validate min/max
  // if (Number(params.amount) < Number(quote.depositMin)) {
  //   throw new Error("Amount below minimum");
  // }

  // if (Number(params.amount) > Number(quote.depositMax)) {
  //   throw new Error("Amount exceeds maximum");
  // }

  return quote;
};