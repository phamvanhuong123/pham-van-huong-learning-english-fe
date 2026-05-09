import ClientLayout from '@/layout/ClientLayout'
import { Route } from 'react-router'

function ClienRoutes() {
  return (
      <Route path='/' element={<ClientLayout/>}>
      </Route>
  )
}
export default ClienRoutes
