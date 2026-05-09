import { useEffect } from "react";

export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [data]);
  return null;
}

export const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vespera",
  url: "https://www.thevespera.online",
  logo: "https://www.thevespera.online/logo.png",
  sameAs: ["https://www.instagram.com/classyclutch16?igsh=cGo5OGdxb2FsZWNq", "https://www.facebook.com/share/1DP1GcGz7B/"],
  contactPoint: { "@type": "ContactPoint", contactType: "customer service", email: "care@vespera.in", areaServed: "IN" },
};
