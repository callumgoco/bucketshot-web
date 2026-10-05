import { LegalDocument } from "@/components/LegalDocument";
import { LEGAL_EFFECTIVE_DATE, privacySections } from "@/lib/legal";

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      sections={privacySections}
      relatedHref="/terms"
      relatedLabel="Terms of Use"
    />
  );
}
