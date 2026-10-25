import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { formatInputDate } from '../../utils/formatDate';

const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  accounts = [],
  categories = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    transactionType: 'Expense',
    accountID: '',
    categoryID: '',
    amount: '',
    transactionDate: formatInputDate(new Date()),
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        transactionType: initialData.transactionType || 'Expense',
        accountID: initialData.accountID?._id || initialData.accountID || '',
        categoryID: initialData.categoryID?._id || initialData.categoryID || '',
        amount: initialData.amount !== undefined ? initialData.amount.toString() : '',
        transactionDate: formatInputDate(initialData.transactionDate || new Date()),
        description: initialData.description || '',
      });
    } else {
      setFormData({
        transactionType: 'Expense',
        accountID: accounts.length > 0 ? accounts[0]._id : '',
        categoryID: '',
        amount: '',
        transactionDate: formatInputDate(new Date()),
        description: '',
      });
    }
  }, [initialData, isOpen, accounts]);

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(
    (c) => c.categoryType === formData.transactionType
  );

  useEffect(() => {
    // Auto select first category if current selection is invalid for type
    if (filteredCategories.length > 0) {
      const exists = filteredCategories.some((c) => c._id === formData.categoryID);
      if (!exists) {
        setFormData((prev) => ({ ...prev, categoryID: filteredCategories[0]._id }));
      }
    }
  }, [formData.transactionType, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
    });
  };

  const accountOptions = accounts.map((a) => ({ label: `${a.accountName} (${a.accountType})`, value: a._id }));
  const categoryOptions = filteredCategories.map((c) => ({ label: c.categoryName, value: c._id }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Record New Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle Buttons */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, transactionType: 'Expense' }))}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              formData.transactionType === 'Expense'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, transactionType: 'Income' }))}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              formData.transactionType === 'Income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Income
          </button>
        </div>

        <Input
          label="Amount (₹)"
          name="amount"
          type="number"
          step="any"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          required
        />

        <Select
          label="Financial Account"
          name="accountID"
          value={formData.accountID}
          onChange={handleChange}
          options={accountOptions}
          placeholder="Select Account"
          required
        />

        <Select
          label="Category"
          name="categoryID"
          value={formData.categoryID}
          onChange={handleChange}
          options={categoryOptions}
          placeholder="Select Category"
          required
        />

        <Input
          label="Date"
          name="transactionDate"
          type="date"
          value={formData.transactionDate}
          onChange={handleChange}
          required
        />

        <Input
          label="Description / Merchant"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g. Swiggy Lunch / Amazon Headphones"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {initialData ? 'Save Transaction' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;
