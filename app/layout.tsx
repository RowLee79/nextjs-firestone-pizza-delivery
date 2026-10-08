import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'Firestone | Pizza Delivery',description:'Customize your pizza, order for delivery and follow your order.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
