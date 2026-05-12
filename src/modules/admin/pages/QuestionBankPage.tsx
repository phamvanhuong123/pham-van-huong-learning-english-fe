import { QuestionBankContainer } from '../components/QuestionBankContainer';

export default function QuestionBankPage() {
  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-foreground">Ngân hàng câu hỏi</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Quản lý, chỉnh sửa, xem trước và import câu hỏi hàng loạt bằng JSON.
        </p>
      </div>

      <QuestionBankContainer />
    </div>
  );
}

