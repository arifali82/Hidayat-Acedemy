import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Hidayat Academy – Islamic Entrance Exam 1448/2026',
  description: 'Apply for Hidayat Academy Islamic Entrance Exam. Academic Year 1448/2026.',
  openGraph: {
    title: 'Hidayat Academy – Islamic Entrance Exam',
    description: 'Begin your journey of sacred knowledge. Apply now for 1448/2026.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#1f5e3a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@300;400;500;600;700;800;900&family=Merriweather:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{if(localStorage.getItem('hidayat-theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}