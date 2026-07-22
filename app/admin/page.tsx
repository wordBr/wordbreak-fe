"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import { API } from "@/lib/config";

type CreatePoolResult = {
  roundId: string;
  entryFee: string;
  endTime: number;
  dateKeys: string[];
};

// Not a real auth system -- the backend's X-Admin-Token gate is the actual security boundary
// (see backend/internal/api/api.go adminOK). This is just a convenience form around the same
// POST /api/admin/pool/create call we were previously making by hand with curl. Token lives in
// sessionStorage only (cleared when the tab closes), never sent anywhere but this one endpoint.
export default function Admin() {
  const [token, setToken] = useState("");
  const [tokenDraft, setTokenDraft] = useState("");

  const [entryFee, setEntryFee] = useState("0.01");
  const [days, setDays] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatePoolResult | null>(null);

  useEffect(() => {
    setToken(sessionStorage.getItem("wb_admin_token") || "");
  }, []);

  const saveToken = () => {
    const t = tokenDraft.trim();
    if (!t) return;
    sessionStorage.setItem("wb_admin_token", t);
    setToken(t);
  };

  const createPool = async () => {
    setError(null);
    setResult(null);
    let feeWei: bigint;
    try {
      feeWei = parseUnits(entryFee || "0", 18);
    } catch {
      setError("Entry fee must be a number.");
      return;
    }
    if (feeWei <= 0n) {
      setError("Entry fee must be greater than 0.");
      return;
    }
    if (days < 1 || days > 90) {
      setError("Days must be between 1 and 90.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/admin/pool/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify({ entryFee: feeWei.toString(), days }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <main className="shell">
        <div className="gate-inner">
          <h1 className="vs-title display">Admin</h1>
          <p className="gate-tag">Enter the admin token to manage pools.</p>
          <input
            className="name-in"
            type="password"
            placeholder="Admin token"
            value={tokenDraft}
            onChange={(e) => setTokenDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && tokenDraft.trim()) saveToken(); }}
            autoFocus
          />
          <button className="btn primary gate-btn" style={{ marginTop: 14 }}
            onClick={saveToken} disabled={!tokenDraft.trim()}>
            Continue
          </button>
          <Link href="/" className="daily-link">← Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      <div className="gate-inner">
        <h1 className="vs-title display">Create a pool</h1>
        <p className="gate-tag">
          Opens a round on-chain and registers it as visible starting today, for however many
          days you choose.
        </p>

        <div className="vs-create-card">
          <label className="gate-note mono" style={{ display: "block", marginBottom: 4 }}>
            Entry fee (cUSD)
          </label>
          <input
            className="vs-stake-in mono"
            type="number" min="0" step="0.01"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
            style={{ width: "100%", marginBottom: 14 }}
          />

          <label className="gate-note mono" style={{ display: "block", marginBottom: 4 }}>
            Runs for how many days (starting today)
          </label>
          <input
            className="vs-stake-in mono"
            type="number" min="1" max="90" step="1"
            value={days}
            onChange={(e) => setDays(Math.max(1, Math.min(90, Number(e.target.value) || 1)))}
            style={{ width: "100%" }}
          />

          <button className="btn primary gate-btn" style={{ marginTop: 14, width: "100%" }}
            onClick={createPool} disabled={busy}>
            {busy ? "Creating…" : "Create pool"}
          </button>
        </div>

        {error && <p className="tx-note err">{error}</p>}

        {result && (
          <div className="pool-card" style={{ marginTop: 14 }}>
            <div className="pool-top">
              <span className="pool-title display">POOL CREATED</span>
            </div>
            <p className="gate-note mono">Round {result.roundId}</p>
            <p className="gate-note mono">
              Ends {new Date(result.endTime * 1000).toUTCString()}
            </p>
            <p className="gate-note mono">
              Visible: {result.dateKeys[0]} → {result.dateKeys[result.dateKeys.length - 1]}
              {" "}({result.dateKeys.length} day{result.dateKeys.length === 1 ? "" : "s"})
            </p>
          </div>
        )}

        <button className="btn ghost" style={{ marginTop: 14 }}
          onClick={() => { sessionStorage.removeItem("wb_admin_token"); setToken(""); }}>
          Log out
        </button>
        <Link href="/" className="daily-link">← Home</Link>
      </div>
    </main>
  );
}
