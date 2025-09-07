import { BigInt } from "@graphprotocol/graph-ts";
import { CredentialIssued } from "../generated/NGOCredentialIssuer/NGOCredentialIssuer";
import { Credential, DailyStat, TypeStat } from "../generated/schema";

function epochDay(ts: BigInt): string {
  const day = ts.toI64() / 86400; // seconds per day
  return day.toString();
}

function bumpDaily(ts: BigInt): void {
  const id = epochDay(ts);
  let d = DailyStat.load(id);
  if (d == null) {
    d = new DailyStat(id);
    d.date = id;
    d.count = BigInt.fromI32(0);
  }
  d.count = d.count.plus(BigInt.fromI32(1));
  d.save();
}

function bumpType(ctype: string): void {
  const id = ctype;
  let t = TypeStat.load(id);
  if (t == null) {
    t = new TypeStat(id);
    t.credentialType = ctype;
    t.count = BigInt.fromI32(0);
  }
  t.count = t.count.plus(BigInt.fromI32(1));
  t.save();
}

export function handleCredentialIssued(e: CredentialIssued): void {
  const id = e.transaction.hash.toHex() + "-" + e.logIndex.toString();

  let c = new Credential(id);
  c.txHash = e.transaction.hash;
  c.issuer = e.params.issuer;
  c.refugee = e.params.refugee;
  c.name = e.params.name;
  c.age = e.params.age;                  // <-- uint8 comes in as i32 already
  c.gender = e.params.gender;
  c.credentialType = e.params.credentialType;
  c.timestamp = e.params.timestamp;
  c.save();

  bumpDaily(e.params.timestamp);
  bumpType(e.params.credentialType);
}
