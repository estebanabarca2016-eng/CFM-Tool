import './globals.css'
import type { Metadata } from 'next'
export const metadata: Metadata = { title:'Corporate Fuel Management Tool', description:'World Fuel Services aviation operations dashboard' }
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
