import DashboardLayout from "@/layout/ClientLayout";
import { Route } from "react-router";
import VocabManagerPage from "@/modules/vocab/pages/VocabManagerPage";
import FlashcardPage from "@/modules/vocab/pages/FlashcardPage";
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import ProfilePage from "@/modules/profile/pages/ProfilePage";
import ExamLibraryPage from "@/modules/exams/pages/ExamLibraryPage";
import ExamHistoryPage from "@/modules/exams/pages/ExamHistoryPage";
import AnalyticsPage from "@/modules/analytics/pages/AnalyticsPage";
import ExamResultPage from "@/modules/exams/pages/ExamResultPage";

function DashboardRoutes(){
    return<Route path="/dashboard" element={<DashboardLayout/>}>
        <Route index element={<DashboardPage />} />
        <Route path="vocab" element={<VocabManagerPage />} />
        <Route path="vocab/practice" element={<FlashcardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="exams" element={<ExamLibraryPage />} />
        <Route path="history" element={<ExamHistoryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="results/:resultId" element={<ExamResultPage />} />
    </Route>
}
export default DashboardRoutes


