import React, { useState, useEffect } from 'react';
import { transactionAPI, accountAPI, categoryAPI } from '../services/api';
import TransactionTable from '../components/Transactions/TransactionTable';
import TransactionFilters from '../components/Transactions/TransactionFilters';
import TransactionModal from '../components/Transactions/TransactionModal';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import { Plus, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    account: '',
    startDate: '',
    endDate: '',
    sortBy: 'newest',
  });

  // Modal & Confirm states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    try {
      const [txRes, accRes, catRes] = await Promise.all([
        transactionAPI.getAll({ ...filters, page, limit: 15 }),
        accountAPI.getAll(),
        categoryAPI.getAll(),
      ]);

      setTransactions(txRes.data.transactions || []);
      setTotalPages(txRes.data.pages || 1);
      setTotalCount(txRes.data.total || 0);

      setAccounts(accRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to load transaction data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, page]);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      account: '',
      startDate: '',
      endDate: '',
      sortBy: 'newest',
    });
    setPage(1);
  };

  const handleSubmitModal = async (formData) => {
    setSubmitting(true);
    try {
      if (editingTransaction) {
        await transactionAPI.update(editingTransaction._id, formData);
        setToast({ type: 'success', message: 'Transaction updated successfully.' });
      } else {
        await transactionAPI.create(formData);
        setToast({ type: 'success', message: 'Transaction added successfully.' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Action failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    setSubmitting(true);
    try {
      await transactionAPI.delete(deletingTransaction._id);
      setToast({ type: 'success', message: 'Transaction deleted.' });
      setDeletingTransaction(null);
      fetchData();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to delete' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading transaction history..." />;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Transaction History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total recorded transactions: <span className="font-bold text-slate-900">{totalCount}</span>
          </p>
        </div>
        <Button onClick={handleOpenAddModal} variant="primary" icon={Plus}>
          Add Transaction
        </Button>
      </div>

      {/* Filters Bar */}
      <TransactionFilters
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        onReset={handleResetFilters}
        categories={categories}
        accounts={accounts}
      />

      {/* Transactions Table or Empty State */}
      {transactions.length === 0 && totalCount === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions yet."
          description="Log your daily incomes and expenses to view reports and track budgets."
          actionText="Add transaction"
          onAction={handleOpenAddModal}
        />
      ) : (
        <>
          <TransactionTable
            transactions={transactions}
            onEdit={handleOpenEditModal}
            onDelete={(tx) => setDeletingTransaction(tx)}
          />

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingTransaction}
        accounts={accounts}
        categories={categories}
        loading={submitting}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction?"
        message="Are you sure you want to delete this transaction? Your account balance will automatically be restored."
        loading={submitting}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Transactions;
