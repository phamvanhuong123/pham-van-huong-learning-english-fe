
import { ExamManagementContainer } from '../components/ExamManagementContainer';

export default function ExamManagementPage() {
  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Quản lý đề thi</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Tạo mới, chỉnh sửa thông tin và quản lý trạng thái công khai của các đề thi TOEIC.
        </p>
      </div>

      <ExamManagementContainer />
    </div>
  );
}
