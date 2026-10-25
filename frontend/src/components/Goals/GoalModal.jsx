import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { formatInputDate } from '../../utils/formatDate';

const GoalModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    goalName: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        goalName: initialData.goalName || '',
        targetAmount: initialData.targetAmount !== undefined ? initialData.targetAmount.toString() : '',
        currentAmount: initialData.currentAmount !== undefined ? initialData.currentAmount.toString() : '0',
        deadline: formatInputDate(initialData.deadline || new Date()),
        description: initialData.description || '',
      });
    } else {
      const defaultDeadline = new Date();
      defaultDeadline.setMonth(defaultDeadline.getMonth() + 6);

      setFormData({
        goalName: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: formatInputDate(defaultDeadline),
        description: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount) || 0,
      currentAmount: parseFloat(formData.currentAmount) || 0,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Goal' : 'Create Financial Goal'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Goal Name"
          name="goalName"
          value={formData.goalName}
          onChange={handleChange}
          placeholder="e.g. Emergency Fund / M3 MacBook Pro"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Target Amount (₹)"
            name="targetAmount"
            type="number"
            value={formData.targetAmount}
            onChange={handleChange}
            placeholder="80000"
            required
          />

          <Input
            label="Current Savings (₹)"
            name="currentAmount"
            type="number"
            value={formData.currentAmount}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <Input
          label="Target Deadline"
          name="deadline"
          type="date"
          value={formData.deadline}
          onChange={handleChange}
          required
        />

        <Input
          label="Description (Optional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g. Savings for new work laptop"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {initialData ? 'Save Goal' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalModal;
