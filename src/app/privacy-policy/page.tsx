import { redirect } from "next/navigation";
import { PRIVACY_POLICY_URL } from "../../lib/legalUrls";

export default function PrivacyPolicyPage() {
  redirect(PRIVACY_POLICY_URL);
}
