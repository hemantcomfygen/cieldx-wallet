import { useEffect, useRef } from "react";
import { ethers } from "ethers";
import { Connection, PublicKey } from "@solana/web3.js";
import { getCoinsFromDB } from "../utils/coins";
import { handleIncomingTransaction } from "../services/notificationService";
import { WSS_ENDPOINTS } from "../config/wssEndpoints";
import { getChainType } from "../utils/blockChianFunctions/getChainType";

const ERC20_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];

export const useBlockchainNotification = () => {
  const providersRef = useRef({});
  const subscriptionsRef = useRef([]);
  const pollersRef = useRef([]);
  const isSettingUpRef = useRef(false);

  const setupListeners = async () => {
    if (isSettingUpRef.current) return;
    isSettingUpRef.current = true;

    console.log("Setting up blockchain listeners for all coins...");
    cleanup();

    try {
      const coinsRes = await getCoinsFromDB();
      if (!coinsRes) {
        isSettingUpRef.current = false;
        return;
      }

      const allCoins = [...(coinsRes.default_coins || []), ...(coinsRes.custom_imported_coins || [])];

      // Group coins by chain
      const coinsByChain = allCoins.reduce((acc, coin) => {
        const chainType = getChainType(coin.shortName);
        const chainId = coin.chainId || chainType;
        if (!acc[chainId]) acc[chainId] = [];
        acc[chainId].push(coin);
        return acc;
      }, {});

      for (const [chainId, coins] of Object.entries(coinsByChain)) {
        const firstCoin = coins[0];
        const chainType = getChainType(firstCoin.shortName);
        const wssUrl = WSS_ENDPOINTS[chainId] || WSS_ENDPOINTS[chainType];

        if (!wssUrl && chainType !== "TRON" && chainType !== "XLM") continue;

        switch (chainType) {
          case "EVM":
            setupEVMListener(wssUrl, coins, chainId);
            break;
          case "SOLANA":
            setupSolanaListener(wssUrl, coins);
            break;
          case "XRP":
            setupXRPListener(wssUrl, coins);
            break;
          case "XLM":
            setupXLMListener(WSS_ENDPOINTS.XLM, coins);
            break;
          case "UTXO":
            setupUTXOListener(wssUrl, coins, chainId);
            break;
          // case "TRON":
          //   setupTronListener(coins);
          //   break;
          default:
            console.warn(`No listener implementation for ${chainType}`);
        }
      }
    } finally {
      isSettingUpRef.current = false;
    }
  };

  // --- EVM ---
  const setupEVMListener = async (wssUrl, coins, chainId) => {
    try {
      const provider = new ethers.WebSocketProvider(wssUrl);
      providersRef.current[chainId] = provider;
      const watchedAddresses = new Set(coins.map(c => c.address?.toLowerCase()));

      // 1. Initial check for the latest transaction to avoid missing anything while offline
      for (const coin of coins) {
        if (coin.address && !coin.is_token) {
          try {
            const balance = await provider.getBalance(coin.address);
            // We can check history here if we had an explorer API, 
            // but for now we rely on the fact that any NEW tx will trigger listeners below.
          } catch (e) { }
        }
      }

      provider.on("pending", async (txHash) => {
        try {
          const tx = await provider.getTransaction(txHash);
          if (tx && tx.to && watchedAddresses.has(tx.to.toLowerCase())) {
            const coin = coins.find(c => c.address?.toLowerCase() === tx.to.toLowerCase() && !c.is_token);
            if (coin && tx.value > 0n) {
              handleIncomingTransaction({
                wallet_id: coin.wallet_id,
                account_id: coin.account_id,
                coin,
                amount: ethers.formatEther(tx.value),
                from: tx.from,
                to: tx.to,
                hash: tx.hash
              });
            }
          }
          // Also check for 'send' from watched addresses
          if (tx && tx.from && watchedAddresses.has(tx.from.toLowerCase())) {
            const coin = coins.find(c => c.address?.toLowerCase() === tx.from.toLowerCase() && !c.is_token);
            if (coin && tx.value > 0n) {
              handleIncomingTransaction({
                wallet_id: coin.wallet_id,
                account_id: coin.account_id,
                coin,
                amount: ethers.formatEther(tx.value),
                from: tx.from,
                to: tx.to,
                hash: tx.hash,
                type: "send"
              });
            }
          }
        } catch (e) { }
      });

      coins.filter(c => c.is_token && c.contractAddress).forEach(token => {
        const contract = new ethers.Contract(token.contractAddress, ERC20_ABI, provider);
        const filter = contract.filters.Transfer(null, token.address);
        contract.on(filter, (from, to, value, event) => {
          handleIncomingTransaction({
            wallet_id: token.wallet_id,
            account_id: token.account_id,
            coin: token,
            amount: ethers.formatUnits(value, token.decimals || 18),
            from,
            to,
            hash: event.log.transactionHash
          });
        });
        subscriptionsRef.current.push({ type: "EVM_TOKEN", contract, filter });
      });
    } catch (e) { console.error("EVM Error:", e); }
  };

  // --- SOLANA ---
  const setupSolanaListener = (wssUrl, coins) => {
    try {
      const connection = new Connection(wssUrl, {
        commitment: "confirmed",
        wsEndpoint: wssUrl.replace("https://", "wss://"),
      });
      providersRef.current["SOLANA"] = connection;

      coins.forEach(coin => {
        if (!coin.address) return;
        try {
          const subId = connection.onAccountChange(new PublicKey(coin.address), () => {
            handleIncomingTransaction({
              wallet_id: coin.wallet_id,
              account_id: coin.account_id,
              coin,
              amount: "Update",
              from: "Blockchain",
              to: coin.address,
              hash: "SOL-" + Date.now()
            });
          });
          subscriptionsRef.current.push({ type: "SOLANA", id: subId, connection });
        } catch (err) {
          console.warn(`Could not subscribe to Solana address ${coin.address}:`, err);
        }
      });
    } catch (e) {
      console.error("Solana Connection Error:", e);
      // Fallback to polling for Solana if WSS fails
      setupSolanaPoller(coins);
    }
  };

  const setupSolanaPoller = (coins) => {
    const lastBalances = {};
    const poll = async () => {
      for (const coin of coins) {
        if (!coin.address) continue;
        try {
          const res = await fetch(WSS_ENDPOINTS.SOLANA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0", id: 1,
              method: "getBalance", params: [coin.address]
            })
          }).then(r => r.json());
          const balance = res.result?.value;
          if (balance !== undefined && lastBalances[coin.address] !== undefined && lastBalances[coin.address] !== balance) {
            handleIncomingTransaction({
              wallet_id: coin.wallet_id,
              account_id: coin.account_id,
              coin,
              amount: "Balance Change",
              from: "Blockchain",
              to: coin.address,
              hash: "SOL-POLL-" + Date.now()
            });
          }
          lastBalances[coin.address] = balance;
        } catch (e) { }
      }
    };
    const interval = setInterval(poll, 20000); // Poll every 20s
    pollersRef.current.push(interval);
  };

  // --- XRP ---
  const setupXRPListener = (wssUrl, coins) => {
    try {
      const ws = new WebSocket(wssUrl);
      providersRef.current["XRP"] = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({ command: "subscribe", accounts: coins.map(c => c.address).filter(Boolean) }));
      };
      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.type === "transaction" && data.transaction.TransactionType === "Payment") {
          const tx = data.transaction;
          const coin = coins.find(c => c.address === tx.Destination);
          if (coin) {
            handleIncomingTransaction({
              wallet_id: coin.wallet_id,
              account_id: coin.account_id,
              coin,
              amount: (tx.Amount / 1000000).toString(),
              from: tx.Account,
              to: tx.Destination,
              hash: tx.hash
            });
          }
        }
      };
    } catch (e) { console.error("XRP Error:", e); }
  };

  // --- XLM (SSE) ---
  const setupXLMListener = (baseUrl, coins) => {
    coins.forEach(coin => {
      if (!coin.address) return;
      const es = new EventSource(`${baseUrl}/accounts/${coin.address}/payments`);
      es.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.to === coin.address) {
          handleIncomingTransaction({
            wallet_id: coin.wallet_id,
            account_id: coin.account_id,
            coin,
            amount: data.amount,
            from: data.from,
            to: data.to,
            hash: data.transaction_hash
          });
        }
      };
      subscriptionsRef.current.push({ type: "XLM", es });
    });
  };

  // --- UTXO (BTC, DOGE, LTC) ---
  const setupUTXOListener = (wssUrl, coins, chainId) => {
    try {
      const ws = new WebSocket(wssUrl);
      providersRef.current[chainId] = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: "sub", method: "subscribeAddresses", params: { addresses: coins.map(c => c.address).filter(Boolean) } }));
      };
      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id === "sub" && data.data && data.data.tx) {
          const tx = data.data.tx;
          const address = data.data.address;
          const coin = coins.find(c => c.address === address);
          if (coin) {
            const amount = tx.vout.find(o => o.addresses.includes(address))?.value || "0";
            handleIncomingTransaction({
              wallet_id: coin.wallet_id,
              account_id: coin.account_id,
              coin,
              amount,
              from: tx.vin[0]?.addresses?.[0] || "Unknown",
              to: address,
              hash: tx.txid
            });
          }
        }
      };
    } catch (e) { console.error("UTXO Error:", e); }
  };

  const lastCheckedTronRef = useRef({});

  // --- TRON (Polling) ---
  const setupTronListener = (coins) => {
    const poll = async () => {
      for (const coin of coins) {
        if (!coin.address) continue;
        try {
          const url = `https://api.trongrid.io/v1/accounts/${coin.address}/transactions${coin.is_token ? "/trc20" : ""}?limit=10`;
          const res = await fetch(url).then(r => r.json());
          const txs = res.data || [];

          if (!lastCheckedTronRef.current[coin.address]) {
            // First time: just record the current hashes and skip
            lastCheckedTronRef.current[coin.address] = txs.map(t => t.txID || t.transaction_id);
            continue;
          }

          for (const tx of txs) {
            const txId = tx?.txID || tx?.transaction_id;
            if (!txId) continue;

            if (!lastCheckedTronRef.current[coin.address].includes(txId)) {
              const isReceive = coin.is_token ? tx.to === coin.address : true;
              if (isReceive) {
                let amount = "0";
                if (coin.is_token) {
                  amount = (tx.value / Math.pow(10, tx.token_info?.decimals || 6)).toString();
                } else {
                  // Native TRX: path is raw_data.contract[0].parameter.value.amount
                  const contract = tx.raw_data?.contract?.[0];
                  const val = contract?.parameter?.value;
                  amount = (Number(val?.amount || 0) / 1e6).toString();
                }

                handleIncomingTransaction({
                  wallet_id: coin.wallet_id,
                  account_id: coin.account_id,
                  coin,
                  amount,
                  from: tx.from || (tx.raw_data?.contract?.[0]?.parameter?.value?.owner_address) || "Unknown",
                  to: coin.address,
                  hash: txId
                });
              }
            }
          }
          lastCheckedTronRef.current[coin.address] = txs.map(t => t.txID || t.transaction_id);
        } catch (e) { }
      }
    };
    const interval = setInterval(poll, 15000);
    pollersRef.current.push(interval);
  };

  const cleanup = () => {
    Object.values(providersRef.current).forEach(p => {
      try { if (p.destroy) p.destroy(); else if (p.close) p.close(); else if (p.terminate) p.terminate(); } catch (e) { }
    });
    providersRef.current = {};
    subscriptionsRef.current.forEach(sub => {
      if (sub.type === "SOLANA") sub.connection.removeAccountChangeListener(sub.id);
      else if (sub.type === "EVM_TOKEN") sub.contract.removeAllListeners(sub.filter);
      else if (sub.type === "XLM") sub.es.close();
    });
    subscriptionsRef.current = [];
    pollersRef.current.forEach(clearInterval);
    pollersRef.current = [];
  };

  useEffect(() => {
    setupListeners();
    const handleUpdate = () => setupListeners();
    window.addEventListener("wallets-updated", handleUpdate);
    window.addEventListener("coins-updated", handleUpdate);
    return () => {
      cleanup();
      window.removeEventListener("wallets-updated", handleUpdate);
      window.removeEventListener("coins-updated", handleUpdate);
    };
  }, []);
};
