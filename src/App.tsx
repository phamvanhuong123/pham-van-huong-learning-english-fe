import './App.css'
import AllRoutes from '@/routes/index'
import { Toaster } from '@/components/ui/sonner'
import { useAppInit } from '@/hooks/useAppInit'

function App() {
  // Tự động refresh accessToken khi page reload
  useAppInit();

  return (
    <>
      <AllRoutes/>
      <Toaster position="top-center" richColors />
    </>
  )
}

export default App
