import Link from "next/link";
import type { LegalSection } from "@/lib/legal";

type LegalDocumentProps = {
  title: string;
  effectiveDate: string;
  sections: LegalSection[];
  relatedHref: string;
  relatedLabel: string;
};

export function LegalDocument({
  title,
  effectiveDate,
  sections,
  relatedHref,
  relatedLabel,
}: LegalDocumentProps) {
  return (
    <article className="mx-auto max-w-2xl pb-8">
      <p className="text-sm font-semibold uppercase tracking-[1.4px] text-[var(--bs-text-tertiary)]">
        BucketShot
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
      <p className="mt-3 text-sm text-[var(--bs-text-secondary)]">
        Effective {effectiveDate}
      </p>
      <p className="mt-2 text-sm text-[var(--bs-text-secondary)]">
        Also see{" "}
        <Link href={relatedHref} className="text-[var(--bs-accent)] underline-offset-2 hover:underline">
          {relatedLabel}
        </Link>
        .
      </p>
      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[var(--bs-text-secondary)]">
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.title}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
