import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://songr.app",
      lastModified: new Date(),
    },
  ];
}
