import { LegalDocument } from "@/components/LegalDocument";
import { LEGAL_EFFECTIVE_DATE, termsSections } from "@/lib/legal";

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Use"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      sections={termsSections}
      relatedHref="/privacy"
      relatedLabel="Privacy Policy"
    />
  );
}
