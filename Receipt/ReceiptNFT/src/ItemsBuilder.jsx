import React, { useEffect, useMemo, useState } from "react";

/* helpers (standalone so this file can be used anywhere) */
const stableStringify = (obj) => {
  const keys = [];
  JSON.stringify(obj, (k, v) => (keys.push(k), v));
  keys.sort();
  return JSON.stringify(obj, keys);
};
async function sha256Hex(input) {
  const data = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const h = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const toNum   = (v) => (isFinite(parseFloat(v)) ? parseFloat(v) : 0);
const toMoney = (n) => (Math.round(n * 100) / 100).toFixed(2);

export default function ItemsBuilder({
  currency = "EUR",
  serialHash = "",                    // from “Product Serial / IMEI” (optional)
  onChange,                           // ({ jsonObj, jsonText, itemsHashHex, perItems })
}) {
  /* UI state for rows */
  const [items, setItems] = useState([
    {
      name: "",
      qty: 1,
      unitPrice: "",
      vatRate: "23",
      hasWarranty: false,
      warrantyType: "RETAILER",       // RETAILER | MANUFACTURER
      warrantyMonths: "",
    },
  ]);
  const [shipping, setShipping] = useState("0.00");
  const [discount, setDiscount] = useState("0.00");

  /* derived basket (net/tax/gross) */
  const basketMath = useMemo(() => {
    let subtotal = 0;
    let tax = 0;

    // first pass: numeric maths only (no hashing here)
    const mathLines = items.map((it) => {
      const qty  = toNum(it.qty);
      const up   = toNum(it.unitPrice);
      const rate = toNum(it.vatRate) / 100;

      const lineNet = qty * up;
      const lineTax = lineNet * rate;

      subtotal += lineNet;
      tax      += lineTax;

      return {
        qty,
        unitPrice: toMoney(up),
        vatRate: it.vatRate ? `${it.vatRate}%` : undefined,
        tax: toMoney(lineTax),
        total: toMoney(lineNet + lineTax),
        hasWarranty: !!it.hasWarranty,
        warranty: it.hasWarranty
          ? {
              type: it.warrantyType === "MANUFACTURER" ? "MANUFACTURER" : "RETAILER",
              months: Number(it.warrantyMonths || 0) || undefined,
            }
          : undefined,
        _nameRaw: (it.name || "").trim(),
      };
    });

    const totals = {
      subtotal: toMoney(subtotal),
      tax:      toMoney(tax),
      ...(toNum(discount) ? { discount: toMoney(toNum(discount)) } : {}),
      ...(toNum(shipping) ? { shipping: toMoney(toNum(shipping)) } : {}),
      grandTotal: toMoney(subtotal + tax + toNum(shipping) - toNum(discount)),
    };

    return { mathLines, totals };
  }, [items, shipping, discount]);

  /* build canonical per-item objects + hashes, basket JSON + basket hash */
  useEffect(() => {
    (async () => {
      const perItems = [];
      for (const ml of basketMath.mathLines) {
        // nameHash — hash of the name only (never store plaintext)
        const nameNorm = ml._nameRaw.toLowerCase();
        const nameHashHex = await sha256Hex(nameNorm);
        const nameHash = `sha256:${nameHashHex}`;

        // canonical object that defines a single product line (no plaintext name)
        const canonicalLine = {
          nameHash,
          qty: ml.qty,
          unitPrice: ml.unitPrice,
          vatRate: ml.vatRate,
          tax: ml.tax,
          total: ml.total,
          ...(ml.hasWarranty && ml.warranty ? { warranty: ml.warranty } : {}),
          ...(serialHash ? { serialHash } : {}), // optional link to device
        };

        // itemHash — hash of the canonical line
        const itemHashHex = await sha256Hex(stableStringify(canonicalLine));
        const itemHash = `sha256:${itemHashHex}`;

        perItems.push({ ...canonicalLine, itemHash });
      }

      const jsonObj = {
        currency,
        lineItems: perItems,          // array with nameHash + itemHash per product
        totals: basketMath.totals,
      };

      const jsonText     = stableStringify(jsonObj);
      const itemsHashHex = await sha256Hex(jsonText);

      onChange?.({
        jsonObj,
        jsonText,
        itemsHashHex,
        perItems,                      // expose individual product hashes upward
      });
    })();
  }, [basketMath, currency, serialHash, onChange]);

  /* UI helpers */
  const updateItem = (i, k, v) => setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const addItem    = () =>
    setItems((arr) => [
      ...arr,
      { name: "", qty: 1, unitPrice: "", vatRate: "23", hasWarranty: false, warrantyType: "RETAILER", warrantyMonths: "" },
    ]);
  const removeItem = (i) => setItems((arr) => arr.filter((_, idx) => idx !== i));

  /* simple warranty title for dropdown */
  const wTitle = (it) => (it.hasWarranty ? "Has warranty" : "No warranty");

  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="h2" style={{ margin: 0 }}>Products / Basket</div>
      <div className="muted" style={{ marginTop: 8 }}>
        Product names are <b>not stored</b> — we store <code>nameHash</code> and a per-product <code>itemHash</code>. Add warranty per item if applicable.
      </div>

      <div className="grid gap" style={{ marginTop: 10 }}>
        {items.map((it, idx) => (
          <div key={idx} className="grid" style={{ gridTemplateColumns: "1.2fr .6fr .8fr .9fr 1.1fr .9fr .7fr auto", gap: 10 }}>
            <input className="input" placeholder="Name (not stored; hashed)" value={it.name}
                   onChange={(e)=>updateItem(idx,"name",e.target.value)} />
            <input className="input" placeholder="Qty" value={it.qty} onChange={(e)=>updateItem(idx,"qty",e.target.value)} />
            <input className="input" placeholder="Unit €" value={it.unitPrice} onChange={(e)=>updateItem(idx,"unitPrice",e.target.value)} />
            <select className="input" value={it.vatRate} onChange={(e)=>updateItem(idx,"vatRate",e.target.value)}>
              <option value="23">VAT 23%</option>
              <option value="13.5">VAT 13.5%</option>
              <option value="9">VAT 9%</option>
              <option value="0">VAT 0%</option>
            </select>

            <select className="input" value={wTitle(it)} onChange={(e)=>updateItem(idx,"hasWarranty", e.target.value === "Has warranty")}>
              <option>No warranty</option>
              <option>Has warranty</option>
            </select>

            <select className="input" disabled={!it.hasWarranty} value={it.warrantyType}
                    onChange={(e)=>updateItem(idx,"warrantyType",e.target.value)}>
              <option value="RETAILER">Retail</option>
              <option value="MANUFACTURER">Manu</option>
            </select>

            <input className="input" disabled={!it.hasWarranty} placeholder="Months (e.g., 24)" value={it.warrantyMonths}
                   onChange={(e)=>updateItem(idx,"warrantyMonths",e.target.value)} />

            <button className="btn" onClick={() => removeItem(idx)}>Remove</button>
          </div>
        ))}

        <div className="grid" style={{ gridTemplateColumns: "auto 1fr 1fr", gap: 10 }}>
          <button className="btn primary" onClick={addItem}>+ Add item</button>
          <input className="input" placeholder="Shipping" value={shipping} onChange={(e)=>setShipping(e.target.value)} />
          <input className="input" placeholder="Discount" value={discount} onChange={(e)=>setDiscount(e.target.value)} />
        </div>

        <div className="hint">
          Subtotal: <b>{basketMath.totals.subtotal}</b> • Tax: <b>{basketMath.totals.tax}</b> • Grand total:{" "}
          <b>{basketMath.totals.grandTotal} {currency}</b>
        </div>
      </div>
    </div>
  );
}
