import { JsonLd } from "@/components/seo/JsonLd";
import type { BreadcrumbItem } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seo";

type PageSeoProps = {
  breadcrumbs?: BreadcrumbItem[];
  extra?: Record<string, unknown> | Record<string, unknown>[];
};

export function PageSeo({ breadcrumbs, extra }: PageSeoProps) {
  const schemas: Record<string, unknown>[] = [];

  if (breadcrumbs?.length) {
    schemas.push(breadcrumbJsonLd(breadcrumbs));
  }
  if (extra) {
    if (Array.isArray(extra)) schemas.push(...extra);
    else schemas.push(extra);
  }

  if (schemas.length === 0) return null;
  return <JsonLd data={schemas.length === 1 ? schemas[0] : schemas} />;
}
