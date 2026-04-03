export interface YieldProviderLiveSource {
  accountNames?: string[];
  fundNames?: string[];
}

export const YIELD_PROVIDER_LIVE_SOURCES: Record<
  string,
  YieldProviderLiveSource
> = {
  mercadopago: {
    fundNames: ["Mercado Fondo - Clase A"],
  },
  uala: {
    accountNames: ["UALA"],
    fundNames: ["Ualintec Ahorro Pesos - Clase A"],
  },
  personal_pay: {
    fundNames: ["Delta Pesos - Clase X"],
  },
  naranja_x: {
    accountNames: ["NARANJA X"],
  },
  prex: {
    fundNames: ["Allaria Ahorro - Clase E"],
  },
  fiwind: {
    accountNames: ["FIWIND"],
    fundNames: ["Delta Pesos - Clase A"],
  },
  letsbit: {
    fundNames: ["ST Zero - Clase D"],
  },
  carrefour_banco: {
    accountNames: ["CARREFOUR BANCO"],
  },
  belo: {
    accountNames: ["BELO"],
  },
  lemon: {
    fundNames: ["Fima Premium - Clase P"],
  },
  astropay: {
    fundNames: ["ST Zero - Clase D"],
  },
  claro_pay: {
    fundNames: ["SBS Ahorro Pesos - Clase A"],
  },
  supervielle: {
    accountNames: ["SUPERVIELLE"],
    fundNames: ["Premier Renta CP en Pesos - Clase A"],
  },
  galicia: {
    fundNames: ["Fima Premium - Clase A"],
  },
  macro: {
    fundNames: ["Pionero Pesos - Clase A"],
  },
  santander: {
    fundNames: ["Super Ahorro $ - Clase A"],
  },
  icbc: {
    fundNames: ["Alpha Pesos - Clase A"],
  },
  bna: {
    accountNames: ["BNA"],
  },
  cocos: {
    fundNames: ["Cocos Rendimiento - Clase A", "Cocos Ahorro - Clase A"],
  },
  iol: {
    fundNames: ["IOL Cash Management - Clase A"],
  },
  balanz: {
    fundNames: ["Balanz Capital Money Market - Clase A"],
  },
};
