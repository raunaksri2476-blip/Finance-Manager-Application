import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const ACCOUNT_TYPES = [
  'Bank Account',
  'Savings Account',
  'Cash',
  'Credit Card',
  'Wallet',
  'Other',
];

const AccountModal = ({ isOpen, onClose, onSubmit, initialData = null, loading = false }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    accountType: 'Bank Account',
    balance: '0',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        accountName: initialData.accountName || '',
        accountType: initialData.accountType || 'Bank Account',
        balance: initialData.balance !== undefined ? initialData.balance.toString() : '0',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        accountName: '',
        accountType: 'Bank Account',
        balance: '0',
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
      balance: parseFloat(formData.balance) || 0,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Account' : 'Add Financial Account'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Account Name"
          name="accountName"
          value={formData.accountName}
          onChange={handleChange}
          placeholder="e.g. HDFC Salary Account"
          required
        />

        <Select
          label="Account Type"
          name="accountType"
          value={formData.accountType}
          onChange={handleChange}
          options={ACCOUNT_TYPES}
          required
        />

        <Input
          label="Initial Balance (₹)"
          name="balance"
          type="number"
          value={formData.balance}
          onChange={handleChange}
          placeholder="0.00"
          required
        />

        <Input
          label="Description (Optional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g. Main salary direct deposit"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {initialData ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AccountModal;
