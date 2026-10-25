import React, { useState, useEffect } from 'react';
import { budgetAPI, categoryAPI } from '../services/api';
import BudgetCard from '../components/Budgets/BudgetCard';
import BudgetModal from '../components/Budgets/BudgetModal';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import { Plus, PieChart } from 'lucide-react';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchBudgets = async () => {
    try {
      const [budRes, catRes] = await Promise.all([
        budgetAPI.getAll(),
        categoryAPI.getAll(),
      ]);
      setBudgets(budRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to fetch budgets.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (formData) => {
    setSubmitting(true);
    try {
      if (editingBudget) {
        await budgetAPI.update(editingBudget._id, formData);
        setToast({ type: 'success', message: 'Budget updated successfully.' });
      } else {
        await budgetAPI.create(formData);
        setToast({ type: 'success', message: 'Budget created successfully.' });
      }
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Action failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBudget) return;
    setSubmitting(true);
    try {
      await budgetAPI.delete(deletingBudget._id);
      setToast({ type: 'success', message: 'Budget deleted.' });
      setDeletingBudget(null);
      fetchBudgets();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to delete budget' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading budget planner..." />;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Budgets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Set monthly limits to keep your spending healthy and under control.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} variant="primary" icon={Plus}>
          Add Budget
        </Button>
      </div>

      {/* Grid or Empty state */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="Create your first budget."
          description="Track your spending by category (e.g. Food, Shopping, Entertainment) and get alerted before you exceed limits."
          actionText="Add budget"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => (
            <BudgetCard
              key={b._id}
              budget={b}
              onEdit={handleOpenEditModal}
              onDelete={(bItem) => setDeletingBudget(bItem)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingBudget}
        categories={categories}
        loading={submitting}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget?"
        message="Are you sure you want to delete this category budget?"
        loading={submitting}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Budgets;
