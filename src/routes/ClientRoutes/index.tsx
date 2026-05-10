import ClientLayout from '@/layout/ClientLayout'
import { ExamWorkspacePage } from '@/modules/workspace/ExamWorkspacePage'
import { Route } from 'react-router'

function ClienRoutes() {
  return (
    <>
      <Route path='/' element={<ClientLayout/>}>
      </Route>
      <Route path='/workspace/:examId' element={<ExamWorkspacePage />} />
    </>
  )
}
export default ClienRoutes
