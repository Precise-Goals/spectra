import React, { useMemo, useState } from "react";
import SwapBox, { ASSET_OPTIONS } from "../components/exchange/SwapBox";

const RATE_TABLE = {
  TYI: 1,
  ETH: 0.00031,
  SEPOLIA_ETH: 0.00031,
  BASE_SEPOLIA_ETH: 0.00031,
};

const TRADING_VIEW_SYMBOL = {
  TYI: "BINANCE:USDTUSD",
  ETH: "BINANCE:ETHUSDT",
  SEPOLIA_ETH: "BINANCE:ETHUSDT",
  BASE_SEPOLIA_ETH: "BINANCE:ETHUSDT",
};

const ASSET_NAME = {
  TYI: "Mock USD (TYI)",
  ETH: "Ethereum (ETH)",
  SEPOLIA_ETH: "Sepolia ETH",
  BASE_SEPOLIA_ETH: "Base Sepolia ETH",
};

export default function Exchange() {
  const [payAmount, setPayAmount] = useState("100.00");
  const [selectedAsset, setSelectedAsset] = useState("ETH");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const receiveRate = RATE_TABLE[selectedAsset] ?? RATE_TABLE.ETH;
  const tradingSymbol =
    TRADING_VIEW_SYMBOL[selectedAsset] ?? TRADING_VIEW_SYMBOL.ETH;

  const receiveAmount = useMemo(() => {
    const parsed = Number(payAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return "";
    }

    return (parsed * receiveRate).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  }, [payAmount, receiveRate]);

  const chartTitle = ASSET_NAME[selectedAsset] ?? selectedAsset;

  return (
    <main className="spectra-exchange-page">
      <div className="spectra-exchange-header">
        <h1 className="spectra-exchange-title">[ EXCHANGE_NODE ]</h1>
        <p className="spectra-exchange-sub">
          Live market routing + wallet execution initialized.
        </p>
      </div>
      <div className="spectra-exchange-layout">
        <div className="spectra-exchange-left">
          <div className="spectra-chart-shell">
            <div className="spectra-chart-head">
              <span className="spectra-chart-label">Live Chart</span>
              <span className="spectra-chart-symbol">{chartTitle}</span>
            </div>
            <iframe
              className="spectra-chart-frame"
              title={`tradingview-${selectedAsset}`}
              src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(tradingSymbol)}&interval=60&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=0&saveimage=0&toolbarbg=0A0A0B&theme=dark&style=1&locale=en`}
            />
          </div>

          <div className="spectra-route-panel">
            <div className="spectra-route-row">
              <span className="spectra-route-key">Exchange Rate</span>
              <span className="spectra-route-value">
                1 TYI = {receiveRate} {selectedAsset}
              </span>
            </div>
            <div className="spectra-route-row">
              <span className="spectra-route-key">Route</span>
              <span className="spectra-route-value">
                Spectra AMM →{" "}
                {ASSET_OPTIONS.find((a) => a.id === selectedAsset)?.label}
              </span>
            </div>
            <div className="spectra-route-row">
              <span className="spectra-route-key">Slippage Tolerance</span>
              <span className="spectra-route-value">0.5%</span>
            </div>
          </div>
        </div>

        <div className="spectra-exchange-right">
          <SwapBox
            payAmount={payAmount}
            onPayAmountChange={setPayAmount}
            receiveAmount={receiveAmount}
            selectedAsset={selectedAsset}
            onAssetChange={setSelectedAsset}
            onTxHashChange={setTxHash}
            onError={setError}
          />

          {txHash && (
            <div className="spectra-tx-panel">Swap submitted: {txHash}</div>
          )}
          {error && <div className="spectra-error-box">{error}</div>}
        </div>
      </div>
    </main>
  );
}
