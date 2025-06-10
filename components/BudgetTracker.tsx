import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function BudgetTracker() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ date: "", category: "", amount: "", month: "" });

  useEffect(() => {
    const saved = localStorage.getItem("expenses");
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddExpense = () => {
    if (form.category && form.amount && form.month) {
      setExpenses([...expenses, { ...form, amount: parseInt(form.amount) }]);
      setForm({ date: "", category: "", amount: "", month: "" });
    }
  };

  const handleDownload = () => {
    const csvContent = ["날짜,항목,지출 금액,월", ...expenses.map(e => `${e.date},${e.category},${e.amount},${e.month}`)].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const budget = {
    "적금": 700000,
    "월세+관리비": 500000,
    "핸드폰 요금": 50000,
    "교통비": 100000,
    "데이트/여가": 400000,
    "식비/생활비": 500000,
    "기타": 150000,
  };

  const monthlySummary = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString();
    const summary = { month, total: 0 };
    Object.keys(budget).forEach((cat) => {
      const total = expenses
        .filter((e) => e.category === cat && e.month === month)
        .reduce((sum, e) => sum + e.amount, 0);
      summary[cat] = total;
      summary.total += total;
    });
    return summary;
  });

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="space-y-2 pt-4">
          <h2 className="text-xl font-bold">지출 입력</h2>
          <Input name="date" placeholder="날짜 (예: 2025-06-10)" value={form.date} onChange={handleChange} />
          <Input name="category" placeholder="항목 (예: 식비/생활비)" value={form.category} onChange={handleChange} />
          <Input name="amount" placeholder="금액" value={form.amount} onChange={handleChange} type="number" />
          <Input name="month" placeholder="월 (1~12 숫자)" value={form.month} onChange={handleChange} type="number" />
          <div className="flex gap-2">
            <Button onClick={handleAddExpense}>지출 추가</Button>
            <Button onClick={handleDownload}>CSV 다운로드</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h2 className="text-xl font-bold mb-2">월별 지출 요약</h2>
          <BarChart width={700} height={300} data={monthlySummary}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(budget).map((cat, idx) => (
              <Bar key={cat} dataKey={cat} stackId="a" fill={`hsl(${idx * 45}, 70%, 60%)`} />
            ))}
          </BarChart>
        </CardContent>
      </Card>
    </div>
  );
}
