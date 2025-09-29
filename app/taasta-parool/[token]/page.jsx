import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = {
  title: "Sea uus parool – SotsiaalAI",
  description: "Taasta oma SotsiaalAI konto turvalise parooli taastamise vormi abil.",
};

export default async function ResetPasswordPage({ params }) {
  const resolvedParams = await params;
  const token = resolvedParams?.token || "";
  return <ResetPasswordForm token={token} />;
}