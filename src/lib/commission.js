export function commissionShares(totalCommission, shared, username) {
  const cents = Math.round(Number(totalCommission || 0) * 100);
  const isMafer = String(username || "").trim().toLowerCase().includes("mafer");

  if (shared) {
    const daniCents = Math.ceil(cents / 2);
    return {
      dani:daniCents / 100,
      mafer:(cents - daniCents) / 100,
    };
  }

  return {
    dani:isMafer ? 0 : cents / 100,
    mafer:isMafer ? cents / 100 : 0,
  };
}
