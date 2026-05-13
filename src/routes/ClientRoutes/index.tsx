// import ClientLayout from '@/layout/ClientLayouts'
// import { ExamWorkspacePage } from '@/modules/workspace/ExamWorkspacePage'
// import { Route } from 'react-router'

// function ClienRoutes() {
//   return (
//     <>
//       <Route path='/' element={<ClientLayout/>}>
//       </Route>
//       <Route path='/workspace/:examId' element={<ExamWorkspacePage />} />
//     </>
//   )
// }
// export default ClienRoutes

import ClientLayout from "@/layout/ClientLayout";
import { Route } from "react-router";
import VocabManagerPage from "@/modules/vocab/pages/VocabManagerPage";
import FlashcardPage from "@/modules/vocab/pages/FlashcardPage";
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import ProfilePage from "@/modules/profile/pages/ProfilePage";
import ExamLibraryPage from "@/modules/exams/pages/ExamLibraryPage";
import ExamHistoryPage from "@/modules/exams/pages/ExamHistoryPage";
import AnalyticsPage from "@/modules/analytics/pages/AnalyticsPage";
import ExamResultPage from "@/modules/exams/pages/ExamResultPage";
import PricingPage from "@/modules/subscription/pages/PricingPage";
import { ExamWorkspacePage } from "@/modules/workspace/ExamWorkspacePage";

function ClientRoutes(){
    return (
        <>
            <Route path="/" element={<ClientLayout/>}>
                <Route index element={<DashboardPage />} />
                <Route path="vocab" element={<VocabManagerPage />} />
                <Route path="vocab/practice" element={<FlashcardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="exams" element={<ExamLibraryPage />} />
                <Route path="history" element={<ExamHistoryPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="results/:resultId" element={<ExamResultPage />} />
                <Route path="pricing" element={<PricingPage />} />
            </Route>
            <Route path="/workspace/:examId" element={<ExamWorkspacePage />} />
        </>
    )
}
export default ClientRoutes


