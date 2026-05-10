import DashboardLayout from "@/layout/DashboardLayout";
import { Route } from "react-router";
import VocabManagerPage from "@/modules/vocab/pages/VocabManagerPage";
import FlashcardPage from "@/modules/vocab/pages/FlashcardPage";

function DashboardRoutes(){
    return<Route path="/dashboard" element={<DashboardLayout/>}>
        <Route path="vocab" element={<VocabManagerPage />} />
        <Route path="vocab/practice" element={<FlashcardPage />} />
    </Route>
}
export default DashboardRoutes
