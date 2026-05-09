export const metadata = {
  title: "ZianTT GuestBook",
  description: "A brutalist-style guestbook, powered by Cloudflare Workers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white text-black font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
