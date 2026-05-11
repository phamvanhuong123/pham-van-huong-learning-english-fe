import DashboardLayout from "@/layout/DashboardLayout";
import { Route } from "react-router";
import VocabManagerPage from "@/modules/vocab/pages/VocabManagerPage";
import FlashcardPage from "@/modules/vocab/pages/FlashcardPage";
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import ProfilePage from "@/modules/profile/pages/ProfilePage";

function DashboardRoutes(){
    return<Route path="/dashboard" element={<DashboardLayout/>}>
        <Route index element={<DashboardPage />} />
        <Route path="vocab" element={<VocabManagerPage />} />
        <Route path="vocab/practice" element={<FlashcardPage />} />
        <Route path="profile" element={<ProfilePage />} />
    </Route>
}
export default DashboardRoutes
