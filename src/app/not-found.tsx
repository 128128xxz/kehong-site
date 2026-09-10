import Link from "next/link";
import SiteLogo from "@/components/site/SiteLogo";

export default function NotFound() {
  return (
    <div className="kh-premium-site texture-paper min-h-screen">
      <header className="kh-header" data-variant="solid" data-scrolled="true">
        <div className="kh-shell kh-header-bar">
          <Link href="/en" className="kh-header-brand" aria-label="Kehong home">
            <SiteLogo locale="en" placement="header" />
          </Link>
          <Link href="/en/contact" className="kh-button kh-button-primary kh-button-compact">Request a quote</Link>
        </div>
      </header>
      <main>
        <section className="kh-page-hero">
          <div className="kh-shell">
            <p className="kh-eyebrow">Kehong · Paper materials & custom packaging</p>
            <h1>Page not found</h1>
            <p className="max-w-xl text-lg leading-8 text-(--kh-muted)">The page may have moved. Return to the Kehong homepage or start a packaging inquiry.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/en" className="kh-button kh-button-light">Back to homepage</Link>
              <Link href="/en/products" className="kh-button kh-button-ghost">Browse products</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
