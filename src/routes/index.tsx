import { Routes } from 'react-router'
import ClienRoutes from './ClientRoutes/index'
import DashboardRoutes from '@/routes/DashboardRoutes'
import AuthRoutes from './AuthRoutes'

function AllRoutes(){
    return<Routes>
      {ClienRoutes()}
      {DashboardRoutes()}
      {AuthRoutes()}
    </Routes>
}
export default AllRoutes