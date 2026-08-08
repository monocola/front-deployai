import { redirect } from "next/navigation";

export default function EmailPlansRedirectPage() {
  redirect("/plans?tab=email");
}
