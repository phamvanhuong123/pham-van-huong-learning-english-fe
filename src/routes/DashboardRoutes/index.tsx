import DashboardLayout from "@/layout/DashboardLayout";
import { Route } from "react-router";

function DashboardRoutes(){
    return<Route path="/dashboard" element={<DashboardLayout/>}>

    </Route>
}
export default DashboardRoutes