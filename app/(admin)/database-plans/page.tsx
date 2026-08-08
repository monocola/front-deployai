import { redirect } from "next/navigation";

export default function DatabasePlansRedirectPage() {
  redirect("/plans?tab=databases");
}
