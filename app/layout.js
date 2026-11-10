import './globals.css';

export const metadata = {
  title: 'Nirnaya | Public Grievance & Budget Intelligence',
  description: 'A transparent, AI-assisted public service platform for grievance resolution and budget accountability.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
