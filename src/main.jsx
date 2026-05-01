import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App as AntApp, message } from 'antd'
import esES from 'antd/locale/es_ES'
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary'
import { InvoiceApp } from './components/InvoiceApp'
import { CompanyConfigProvider } from './context/CompanyConfigContext'
import { AuthProvider } from './context/AuthContext'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import './index.css'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      message.error(`Error al cargar datos: ${error.message}`)
    }
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      message.error(`Error: ${error.message}`)
    }
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider 
      locale={esES}
      theme={{
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 8,
          fontFamily: 'Inter, system-ui, sans-serif'
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AntApp>
          <GlobalErrorBoundary>
            <AuthProvider>
              <CompanyConfigProvider>
                <InvoiceApp />
              </CompanyConfigProvider>
            </AuthProvider>
          </GlobalErrorBoundary>
        </AntApp>
      </QueryClientProvider>
    </ConfigProvider>
  </StrictMode>,
)
