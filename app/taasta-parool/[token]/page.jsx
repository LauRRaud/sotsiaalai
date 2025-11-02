import ResetPasswordForm from "./ResetPasswordForm";
export const metadata = {
  title: "Uuenda parool – SotsiaalAI",
  description: "Uuenda oma SotsiaalAI konto parool turvalise vormi abil.",
};
export default async function ResetPasswordPage({ params }) {
  const resolvedParams = await params;
  const token = resolvedParams?.token || "";
  return <ResetPasswordForm token={token} />;
}
