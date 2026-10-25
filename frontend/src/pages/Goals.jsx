import React, { useState, useEffect } from 'react';
import { goalAPI } from '../services/api';
import GoalCard from '../components/Goals/GoalCard';
import GoalModal from '../components/Goals/GoalModal';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import { Plus, Target } from 'lucide-react';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchGoals = async () => {
    try {
      const res = await goalAPI.getAll();
      setGoals(res.data || []);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to fetch financial goals.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenAddModal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleAddMoney = async (goalId, amount) => {
    try {
      await goalAPI.addMoney(goalId, amount);
      setToast({ type: 'success', message: 'Savings added to goal!' });
      fetchGoals();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to add money' });
    }
  };

  const handleSubmitModal = async (formData) => {
    setSubmitting(true);
    try {
      if (editingGoal) {
        await goalAPI.update(editingGoal._id, formData);
        setToast({ type: 'success', message: 'Goal updated successfully.' });
      } else {
        await goalAPI.create(formData);
        setToast({ type: 'success', message: 'Goal created successfully.' });
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Action failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGoal) return;
    setSubmitting(true);
    try {
      await goalAPI.delete(deletingGoal._id);
      setToast({ type: 'success', message: 'Goal deleted.' });
      setDeletingGoal(null);
      fetchGoals();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to delete goal' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading financial goals..." />;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial Goals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Save systematically for your future milestones, laptops, emergency funds, and trips.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} variant="primary" icon={Plus}>
          Add Goal
        </Button>
      </div>

      {/* Grid or Empty state */}
      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Start your first financial goal."
          description="Create savings targets like New Laptop, Emergency Fund, or Travel Fund and deposit money towards them."
          actionText="Add goal"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => (
            <GoalCard
              key={g._id}
              goal={g}
              onEdit={handleOpenEditModal}
              onDelete={(gItem) => setDeletingGoal(gItem)}
              onAddMoney={handleAddMoney}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingGoal}
        loading={submitting}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Goal?"
        message="Are you sure you want to remove this financial goal?"
        loading={submitting}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Goals;
