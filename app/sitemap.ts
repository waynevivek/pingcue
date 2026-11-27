import type { MetadataRoute } from "next";
import { getSitemapRoutes } from "@/lib/seo-routes";
import { getSiteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return getSitemapRoutes().map((route) => {
    const url = route.path === "/" ? `${siteUrl}/` : `${siteUrl}${route.path}`;
    return {
      url,
      lastModified: route.lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      ...(route.includeOgImage
        ? { images: [`${siteUrl}/opengraph-image`] }
        : {}),
    };
  });
}
