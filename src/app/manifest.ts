import type { MetadataRoute } from "next";

// Lets students "Add to Home Screen" and open the site like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "U Macros",
    short_name: "U Macros",
    description: "Track your macros from University of Utah dining halls.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f6f4",
    theme_color: "#be0000",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
