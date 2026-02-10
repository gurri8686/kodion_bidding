export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#E9ECEF] min-h-screen">
      {children}
    </div>
  );
}
