import { QuestionBankContainer } from '../components/QuestionBankContainer';

export default function QuestionBankPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ngân hàng câu hỏi</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Quản lý, chỉnh sửa, xem trước và import câu hỏi hàng loạt bằng JSON.
        </p>
      </div>

      <QuestionBankContainer />
    </div>
  );
}

