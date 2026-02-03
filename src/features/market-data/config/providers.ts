export const YIELD_PROVIDERS: Record<string, { name: string; color: string }> =
  {
    mercadopago: { name: "Mercado Pago", color: "#009EE3" },
    uala: { name: "Ualá", color: "#FF505F" },
    personal_pay: { name: "Personal Pay", color: "#00A9E0" },
    naranja_x: { name: "Naranja X", color: "#FF7D00" },
    prex: { name: "Prex", color: "#4A49E4" },
    fiwind: { name: "Fiwind", color: "#1E1E1E" },
    letsbit: { name: "LetsBit", color: "#B831F2" },
    carrefour_banco: { name: "Carrefour Banco", color: "#1E429F" },
    belo: { name: "Belo", color: "#5D5FEF" },
    lemon: { name: "Lemon Cash", color: "#00CC66" },
    astropay: { name: "AstroPay", color: "#E94E25" },
    claro_pay: { name: "Claro Pay", color: "#EF3829" },
    supervielle: { name: "Supervielle", color: "#C8102E" },
    galicia: { name: "Galicia", color: "#FA6400" },
    macro: { name: "Macro", color: "#003057" },
    santander: { name: "Santander", color: "#EC0000" },
    icbc: { name: "ICBC", color: "#B4142D" },
    bna: { name: "Banco Nación", color: "#0072CE" },
    cocos: { name: "Cocos", color: "#FDE047" },
    iol: { name: "IOL (InvertirOnline)", color: "#00C397" },
    balanz: { name: "Balanz", color: "#1D324F" },
  };

export function getProviderName(id: string): string {
  return YIELD_PROVIDERS[id]?.name || id.replace(/_/g, " ").toUpperCase();
}
