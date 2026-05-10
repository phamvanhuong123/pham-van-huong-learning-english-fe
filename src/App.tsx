import './App.css'
import AllRoutes from '@/routes/index'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <>
      <AllRoutes/>
      <Toaster position="top-center" richColors />
    </>
  )
}

export default App
