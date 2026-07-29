import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import theme from './theme'
import { router } from './Link'
import './index.css'
import { Toaster } from './components/ui/sonner'
import { SidebarProvider } from './components/ui/sidebar'

document.documentElement.classList.add("dark");

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster position="top-center"
      richColors
      toastOptions={{
        style: {
          background: "#09052d",
          color: "#ffffff",
          border: "1px solid #27272a",
        },
      }} />
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </QueryClientProvider>
  </StrictMode>
)