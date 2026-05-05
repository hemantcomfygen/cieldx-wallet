import React, { useState } from "react";
import { FiArrowUpRight, FiArrowDownLeft, FiRepeat } from "react-icons/fi";
import NotFound from "../NotFound/NotFound";
import CardSkeleton from "../Loader/Skeleton/CardSkeleton";
import TransactionList from "../Transction/TransactionList";
import Modal from "../Modal/Modal";
const TradeSection = ({ isLoading, coinTransactionData, handleClick }) => {

  const groupTransactionsByDate = (transactions) => {
    if (!Array.isArray(transactions)) return {};
    
    // Sort transactions by timestamp descending
    const sortedTxs = [...transactions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const groups = {};
    sortedTxs.forEach((tx) => {
      const ts = tx.timestamp ? Number(tx.timestamp) : null;
      const dateStr = ts ? new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) : "Unknown Date";

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(tx);
    });
    return groups;
  };

  const groupedTxs = groupTransactionsByDate(coinTransactionData);

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-6">Your activity</h3>

        {isLoading ? (
          <CardSkeleton loading={isLoading} />
        ) : (
          Object.keys(groupedTxs).length > 0 ? (
            Object.keys(groupedTxs).map((date) => (
              <div key={date} className="space-y-3">
                <p className="text-sm font-medium text-gray-500 mt-6 mb-2">{date}</p>
                <div className="space-y-2">
                  {groupedTxs[date].map((t, i) => (
                    <TransactionList
                      key={t?.hash || i}
                      transaction={t}
                      onClick={() => handleClick(t)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center bg-glass-bg rounded-3xl border border-dashed border-white/10">
              <NotFound message="No transaction found" />
            </div>
          )
        )}
      </div>
    </>
  );
};

export default TradeSection;