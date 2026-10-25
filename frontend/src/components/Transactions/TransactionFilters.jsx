import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const TransactionFilters = ({
  filters,
  onChange,
  onReset,
  categories = [],
  accounts = [],
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Income', value: 'Income' },
    { label: 'Expense', value: 'Expense' },
  ];

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...categories.map((c) => ({ label: c.categoryName, value: c._id })),
  ];

  const accountOptions = [
    { label: 'All Accounts', value: '' },
    ...accounts.map((a) => ({ label: a.accountName, value: a._id })),
  ];

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Highest Amount', value: 'highest' },
    { label: 'Lowest Amount', value: 'lowest' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            icon={Search}
            name="search"
            value={filters.search || ''}
            onChange={handleInputChange}
            placeholder="Search transaction description..."
          />
        </div>

        {/* Type */}
        <Select
          name="type"
          value={filters.type || ''}
          onChange={handleInputChange}
          options={typeOptions}
          placeholder="Filter Type"
        />

        {/* Category */}
        <Select
          name="category"
          value={filters.category || ''}
          onChange={handleInputChange}
          options={categoryOptions}
          placeholder="Filter Category"
        />

        {/* Account */}
        <Select
          name="account"
          value={filters.account || ''}
          onChange={handleInputChange}
          options={accountOptions}
          placeholder="Filter Account"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 items-center">
        {/* Date Range */}
        <Input
          type="date"
          name="startDate"
          value={filters.startDate || ''}
          onChange={handleInputChange}
          placeholder="Start Date"
        />

        <Input
          type="date"
          name="endDate"
          value={filters.endDate || ''}
          onChange={handleInputChange}
          placeholder="End Date"
        />

        {/* Sort */}
        <Select
          name="sortBy"
          value={filters.sortBy || 'newest'}
          onChange={handleInputChange}
          options={sortOptions}
        />

        {/* Reset Filters */}
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
