import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import IncomeExpenseChart from '../components/Charts/IncomeExpenseChart';
import CategoryChart from '../components/Charts/CategoryChart';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchReport = async () => {
    try {
      const res = await reportAPI.getMonthly();
      setReport(res.data);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to generate financial report.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Export CSV Functionality
  const exportCSV = () => {
    if (!report || !report.recentTransactions) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Description,Category,Account,Type,Amount (INR)\n';

    report.recentTransactions.forEach((tx) => {
      const date = formatDate(tx.transactionDate);
      const desc = `"${(tx.description || '').replace(/"/g, '""')}"`;
      const cat = `"${tx.categoryID?.categoryName || 'General'}"`;
      const acc = `"${tx.accountID?.accountName || 'Account'}"`;
      const type = tx.transactionType;
      const amt = tx.amount;
      csvContent += `${date},${desc},${cat},${acc},${type},${amt}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finance_Manager_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ type: 'success', message: 'CSV Report downloaded successfully.' });
  };

  // Real PDF Export Functionality using jsPDF & autoTable
  const exportPDF = () => {
    if (!report) return;

    const doc = new jsPDF();

    // Title & Header
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('FINANCE MANAGER - FINANCIAL STATEMENT', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated for: ${user?.name || 'User'} (${user?.email || ''}) | Date: ${new Date().toLocaleDateString()}`, 14, 26);

    // Summary Section
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 14, 45);

    const summaryData = [
      ['Total Balance Net Worth', formatCurrency(report.totalBalance)],
      ['Total Monthly Income', formatCurrency(report.totalIncome)],
      ['Total Monthly Expenses', formatCurrency(report.totalExpenses)],
      ['Net Savings Outflow', formatCurrency(report.savings)],
    ];

    doc.autoTable({
      startY: 50,
      head: [['Metric', 'Amount']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillStyle: 'F', fillColor: [16, 185, 129] },
    });

    // Account Balances
    const finalY1 = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Account Balances Breakdown', 14, finalY1);

    const accountRows = (report.accounts || []).map((a) => [a.name, a.type, formatCurrency(a.balance)]);
    doc.autoTable({
      startY: finalY1 + 5,
      head: [['Account Name', 'Type', 'Current Balance']],
      body: accountRows,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] },
    });

    // Budget Performance
    const finalY2 = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Budget Performance', 14, finalY2);

    const budgetRows = (report.budgetPerformance || []).map((b) => [
      b.category,
      formatCurrency(b.budgetAmount),
      formatCurrency(b.spent),
      formatCurrency(b.remaining),
      `${b.percentage}%`,
    ]);
    doc.autoTable({
      startY: finalY2 + 5,
      head: [['Category', 'Budget Limit', 'Spent', 'Remaining', 'Usage %']],
      body: budgetRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`Financial_Report_${user?.name || 'User'}_${new Date().toISOString().split('T')[0]}.pdf`);
    setToast({ type: 'success', message: 'PDF Report downloaded successfully.' });
  };

  if (loading) return <Loading message="Generating analytics report..." />;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Export official statements and analyze cashflow trends.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={FileSpreadsheet} onClick={exportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" icon={FileText} onClick={exportPDF}>
            Export PDF Report
          </Button>
        </div>
      </div>

      {/* Analytics Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase">Net Worth Balance</span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(report?.totalBalance)}</h3>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase">Income</span>
          <h3 className="text-xl font-extrabold text-emerald-600 mt-1">{formatCurrency(report?.totalIncome)}</h3>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase">Expenses</span>
          <h3 className="text-xl font-extrabold text-rose-600 mt-1">{formatCurrency(report?.totalExpenses)}</h3>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase">Net Savings</span>
          <h3 className="text-xl font-extrabold text-indigo-600 mt-1">{formatCurrency(report?.savings)}</h3>
        </div>
      </div>

      {/* Category Spending Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Category Expense Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(report?.categorySpending || []).map((cat) => (
                <tr key={cat.name} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-800">{cat.name}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-rose-600">
                    {formatCurrency(cat.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Reports;
