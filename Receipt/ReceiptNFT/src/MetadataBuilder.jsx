import React, { useEffect, useMemo, useState } from "react";
import ItemsBuilder from "./ItemsBuilder.jsx";

/* ---------- env ---------- */
const BRAND_IMAGE_URI = import.meta.env.VITE_BRAND_IMAGE_URI || "";

/* ---------- time utils (Europe/Dublin) ---------- */
const pad2 = (n) => String(n).padStart(2, "0");
function isoInTimeZone(tz, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-IE", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce((a, p) => ((a[p.type] = p.value), a), {});
  const local = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
  const asUTC = new Date(local + "Z");
  const offsetMin = Math.round((asUTC - date) / 60000);
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  return `${local}${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
}
const isoNowIE = () => isoInTimeZone("Europe/Dublin");
const friendlyIEFromISO = (iso) => {
  try {
    return new Intl.DateTimeFormat("en-IE", {
      timeZone: "Europe/Dublin",
      dateStyle: "medium",
      timeStyle: "short",
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return "";
  }
};
// date-only like "16 Oct 2026"
const friendlyDateIE = (iso) => {
  try {
    return new Intl.DateTimeFormat("en-IE", {
      timeZone: "Europe/Dublin",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
};
// add N months (Z normalized ISO)
function addMonthsIso(startIso, months) {
  try {
    const d = new Date(startIso);
    if (isNaN(d)) return "";
    const nd = new Date(
      Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth() + Number(months || 0),
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds()
      )
    );
    return nd.toISOString().replace(/\.\d{3}Z$/, "Z");
  } catch {
    return "";
  }
}

/* ---------- JSON helpers ---------- */
const stableStringify = (obj, space = 0) => {
  const keys = [];
  JSON.stringify(obj, (k, v) => (keys.push(k), v));
  keys.sort();
  return JSON.stringify(obj, keys, space);
};

export default function MetadataBuilder({ onReady }) {
  /* ===== Builder state ===== */
  const [merchantId, setMerchantId] = useState("");
  const [purchaseTimestamp, setPurchaseTimestamp] = useState(isoNowIE());
  const [currency, setCurrency] = useState("EUR");
  const [status, setStatus] = useState("ACTIVE");

  const [totalAmount, setTotalAmount] = useState("");
  const [itemsHash, setItemsHash] = useState("");
  const [itemsCount, setItemsCount] = useState(0);
  const [itemsTotals, setItemsTotals] = useState(null);
  const [perItems, setPerItems] = useState([]);

  const [serialInput, setSerialInput] = useState("");
  const [serialHash, setSerialHash] = useState("");

  /* basket summary line */
  const basketSummary = useMemo(() => {
    if (!itemsTotals) return "";
    const p = [];
    p.push(`${itemsCount} item${itemsCount === 1 ? "" : "s"}`);
    if (itemsTotals.subtotal) p.push(`subtotal ${itemsTotals.subtotal} ${currency}`);
    if (itemsTotals.tax) p.push(`tax ${itemsTotals.tax} ${currency}`);
    if (itemsTotals.shipping) p.push(`shipping ${itemsTotals.shipping} ${currency}`);
    if (itemsTotals.discount) p.push(`discount ${itemsTotals.discount} ${currency}`);
    if (itemsTotals.grandTotal) p.push(`total ${itemsTotals.grandTotal} ${currency}`);
    return p.join(" • ");
  }, [itemsTotals, itemsCount, currency]);

  /* warranty roll-up */
  const warrantySummary = useMemo(() => {
    if (!perItems?.length) return "";
    let covered = 0;
    const buckets = [];
    perItems.forEach((li) => {
      if (li.warranty?.months) {
        covered++;
        buckets.push(
          `${li.warranty.months}m ${
            li.warranty.type?.toLowerCase?.() === "manufacturer" ? "manufacturer" : "retailer"
          }`
        );
      }
    });
    const coveredPart = `${covered} item(s) covered${covered ? ` (${buckets.join(", ")})` : ""}`;
    const noW = perItems.length - covered;
    return noW > 0 ? `${coveredPart}, ${noW} no warranty` : coveredPart;
  }, [perItems]);

  /* per-item warranty end dates + labels "Product N" with friendly date */
  const itemsWithEnds = useMemo(() => {
    const ts = purchaseTimestamp;
    return (perItems || []).map((li, idx) => {
      const months = Number(li?.warranty?.months || 0);
      const endIso = months > 0 ? addMonthsIso(ts, months) : "";
      const label = `Product ${idx + 1}`;
      return endIso ? { label, ...li, warrantyEnds: friendlyDateIE(endIso) } : { label, ...li };
    });
  }, [perItems, purchaseTimestamp]);

  const warrantyEndsSummary = useMemo(() => {
    const ends = itemsWithEnds
      .map((li) =>
        li.warrantyEnds
          ? `${li.warranty?.months}m ${
              li.warranty?.type ? li.warranty.type.toLowerCase() : "retailer"
            } → ${li.warrantyEnds}`
          : ""
      )
      .filter(Boolean);
    return ends.length ? ends.join(" • ") : "";
  }, [itemsWithEnds]);

  /* build metadata */
  const buildMetadata = (tsOverride) => {
    const ts = tsOverride || purchaseTimestamp;

    const attrs = [
      { trait_type: "merchantId", value: merchantId || "" },
      { trait_type: "purchaseTimestamp", value: ts || "" },
      { trait_type: "purchaseTimeZone", value: "Europe/Dublin" },
      { trait_type: "totalAmount", value: totalAmount || "" },
      { trait_type: "currency", value: currency || "" },
      { trait_type: "status", value: status || "ACTIVE" },
      { trait_type: "itemsHash", value: itemsHash ? `sha256:${itemsHash}` : "" },
      { trait_type: "lineItemCount", value: String(itemsCount || 0) },
      { trait_type: "basketSummary", value: basketSummary || "" },
      { trait_type: "warrantySummary", value: warrantySummary || "" },
      ...(warrantyEndsSummary ? [{ trait_type: "warrantyEnds", value: warrantyEndsSummary }] : []),
    ].filter((a) => a.value && String(a.value).trim());

    const purchasedNice = friendlyIEFromISO(ts);
    let description = `Proof of purchase (privacy-safe). Purchased on ${purchasedNice}.`;
    if (warrantyEndsSummary) description += ` Warranty end dates: ${warrantyEndsSummary}.`;

    const meta = {
      name: "Receipt",
      description,
      attributes: attrs,
      items: itemsWithEnds, // human “Product N”, warrantyEnds as friendly date
    };
    if (BRAND_IMAGE_URI) meta.image = BRAND_IMAGE_URI;
    return meta;
  };

  const jsonPreview = useMemo(
    () =>
      stableStringify(buildMetadata(), 2),
    [merchantId, purchaseTimestamp, currency, status, totalAmount, itemsHash, itemsCount, basketSummary, warrantySummary, itemsWithEnds, warrantyEndsSummary]
  );

  const setNowIrish = () => setPurchaseTimestamp(isoNowIE());
  const hashSerial = async () => {
    try {
      if (!serialInput.trim()) return setSerialHash("");
      const data = new TextEncoder().encode(serialInput.trim());
      const h = await crypto.subtle.digest("SHA-256", data);
      const hex = [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
      setSerialHash(`sha256:${hex}`);
      setSerialInput("");
    } catch {
      setSerialHash("");
      alert("Could not hash serial/IMEI");
    }
  };

  const downloadMetadata = () => {
    const meta = buildMetadata(isoNowIE());
    const json = stableStringify(meta, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "receipt.metadata.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleUseInMinter = () => {
    const meta = buildMetadata(isoNowIE());
    onReady?.(stableStringify(meta));
  };

  /* ===== UI (builder only) ===== */
  return (
    <div className="grid gap">
      <label className="label">
        <span>merchantId (use your domain)</span>
        <input className="input" value={merchantId} onChange={(e) => setMerchantId(e.target.value)} placeholder="yourdomain.ie" />
      </label>

      <div className="label">
        <span className="label-strong">purchaseTimestamp (Irish) / currency / status</span>
        <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr 1fr", gap: 12 }}>
          <input className="input" value={purchaseTimestamp} onChange={(e) => setPurchaseTimestamp(e.target.value)} placeholder="YYYY-MM-DDTHH:mm:ss+HH:MM" />
          <input className="input" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="EUR" />
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>ACTIVE</option>
            <option>PARTIALLY_REFUNDED</option>
            <option>REFUNDED</option>
            <option>VOID</option>
          </select>
        </div>
        <div className="hint">
          Irish time: <strong>{friendlyIEFromISO(purchaseTimestamp) || "—"}</strong>
        </div>
        <div>
          <button type="button" className="btn micro" onClick={setNowIrish}>
            Now (Irish)
          </button>
        </div>
      </div>

      <div className="label">
        <span className="label-strong">Product Serial / IMEI (hashed only)</span>
        <div className="grid row2">
          <input className="input" value={serialInput} onChange={(e) => setSerialInput(e.target.value)} placeholder="Enter serial/IMEI to hash (never stored)" />
          <button type="button" className="btn" onClick={hashSerial}>
            Hash &amp; Clear
          </button>
        </div>
        <div className={serialHash ? "hint ok" : "hint"}>{serialHash ? `serialHash = ${serialHash}` : "Not set"}</div>
      </div>

      <div className="label">
        <span className="label-strong">itemsHash (built from Products / Basket)</span>
        <ItemsBuilder
          currency={currency}
          serialHash={serialHash}
          onChange={({ jsonObj, itemsHashHex, perItems }) => {
            setItemsHash(itemsHashHex);
            setItemsTotals(jsonObj?.totals || null);
            setItemsCount(Array.isArray(jsonObj?.lineItems) ? jsonObj.lineItems.length : 0);
            setPerItems(Array.isArray(perItems) ? perItems : []);
            setTotalAmount(jsonObj?.totals?.grandTotal || "");
          }}
        />
        <div className={itemsHash ? "hint ok" : "hint"}>{itemsHash ? `itemsHash = sha256:${itemsHash}` : "Add products to compute itemsHash"}</div>
        {basketSummary && (
          <div className="hint">
            Summary: <strong>{basketSummary}</strong>
          </div>
        )}
        {warrantySummary && (
          <div className="hint">
            Warranty: <strong>{warrantySummary}</strong>
          </div>
        )}
        {warrantyEndsSummary && (
          <div className="hint">
            Warranty ends: <strong>{warrantyEndsSummary}</strong>
          </div>
        )}
      </div>

      <label className="label">
        <span className="label-strong">Preview (tokenURI JSON)</span>
        <textarea className="input mono" value={jsonPreview} readOnly rows={14} />
      </label>

      <div className="grid row2">
        <button className="btn" onClick={downloadMetadata}>
          Download JSON
        </button>
        <button className="btn primary" onClick={handleUseInMinter}>
          Use this JSON in minter
        </button>
      </div>
    </div>
  );
}
