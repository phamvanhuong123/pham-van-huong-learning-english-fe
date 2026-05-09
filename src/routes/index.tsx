import { Routes } from 'react-router'
import ClienRoutes from './ClientRoutes/index'
import DashboardRoutes from '@/routes/DashboardRoutes'

function AllRoutes(){
    return<Routes>
      {ClienRoutes()}
      {DashboardRoutes()}
    </Routes>
}
export default AllRoutes