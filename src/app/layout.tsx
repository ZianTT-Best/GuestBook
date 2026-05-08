export const metadata = {
  title: "ZianTT GuestBook",
  description: "A geek-style guestbook with CTF elements, powered by Cloudflare Workers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-terminal-bg text-terminal-fg font-mono antialiased selection:bg-terminal-green/30">
        {children}
      </body>
    </html>
  );
}
