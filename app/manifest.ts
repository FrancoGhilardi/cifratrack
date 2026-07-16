import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CifraTrack - Control Personal de Finanzas",
    short_name: "CifraTrack",
    description:
      "Gestiona tus ingresos, egresos e inversiones de manera simple y efectiva",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/icon.png",
        sizes: "2048x2048",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "2048x2048",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
