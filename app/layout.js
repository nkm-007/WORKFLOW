import "./globals.css";

export const metadata = {
  title: "Microgreens Tracker",
  description: "Track your microgreens growing cycles",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
