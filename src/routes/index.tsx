import { Routes } from 'react-router'
import ClienRoutes from './ClientRoutes/index'
// import DashboardRoutes from '@/routes/DashboardRoutes'
import AuthRoutes from './AuthRoutes'
import AdminRoutes from './AdminRoutes'

function AllRoutes(){
    return<Routes>
      {ClienRoutes()}
      {/* {DashboardRoutes()} */}
      {AuthRoutes()}
      {AdminRoutes()}
    </Routes>
}
export default AllRoutes
