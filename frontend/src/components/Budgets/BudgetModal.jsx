import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { formatInputDate } from '../../utils/formatDate';

const BudgetModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    categoryID: '',
    budgetAmount: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const expenseCats = categories.filter((c) => c.categoryType === 'Expense');
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (initialData) {
      setFormData({
        categoryID: initialData.categoryID?._id || initialData.categoryID || '',
        budgetAmount: initialData.budgetAmount !== undefined ? initialData.budgetAmount.toString() : '',
        startDate: formatInputDate(initialData.startDate || firstDay),
        endDate: formatInputDate(initialData.endDate || lastDay),
      });
    } else {
      setFormData({
        categoryID: expenseCats.length > 0 ? expenseCats[0]._id : '',
        budgetAmount: '',
        startDate: formatInputDate(firstDay),
        endDate: formatInputDate(lastDay),
      });
    }
  }, [initialData, isOpen, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      budgetAmount: parseFloat(formData.budgetAmount) || 0,
    });
  };

  const expenseCategories = categories
    .filter((c) => c.categoryType === 'Expense')
    .map((c) => ({ label: c.categoryName, value: c._id }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Budget' : 'Create Category Budget'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Category"
          name="categoryID"
          value={formData.categoryID}
          onChange={handleChange}
          options={expenseCategories}
          placeholder="Select Expense Category"
          required
        />

        <Input
          label="Budget Limit (₹)"
          name="budgetAmount"
          type="number"
          value={formData.budgetAmount}
          onChange={handleChange}
          placeholder="e.g. 8000"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />

          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {initialData ? 'Save Changes' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetModal;
