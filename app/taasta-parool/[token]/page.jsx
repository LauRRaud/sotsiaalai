import ResetPasswordForm from "./ResetPasswordForm";
export const metadata = {
  title: "Uuenda PIN – SotsiaalAI",
  description: "Uuenda oma SotsiaalAI konto PIN turvalise vormi abil.",
};
export default async function ResetPasswordPage({ params }) {
  const resolvedParams = await params;
  const token = resolvedParams?.token || "";
  return <ResetPasswordForm token={token} />;
}
