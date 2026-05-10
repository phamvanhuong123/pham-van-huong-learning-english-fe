import DashboardLayout from "@/layout/DashboardLayout";
import { Route } from "react-router";
import VocabManagerPage from "@/modules/vocab/pages/VocabManagerPage";

function DashboardRoutes(){
    return<Route path="/dashboard" element={<DashboardLayout/>}>
        <Route path="vocab" element={<VocabManagerPage />} />
    </Route>
}
export default DashboardRoutes