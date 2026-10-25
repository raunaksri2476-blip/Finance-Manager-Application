import React, { useState, useEffect } from 'react';
import { accountAPI } from '../services/api';
import AccountCard from '../components/Accounts/AccountCard';
import AccountModal from '../components/Accounts/AccountModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import { Plus, WalletCards, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [viewingAccountDetails, setViewingAccountDetails] = useState(null);
  const [accountTransactions, setAccountTransactions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchAccounts = async () => {
    try {
      const res = await accountAPI.getAll();
      setAccounts(res.data || []);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to fetch accounts.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleViewAccount = async (account) => {
    try {
      const res = await accountAPI.getById(account._id);
      setViewingAccountDetails(res.data.account);
      setAccountTransactions(res.data.transactions || []);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load account transactions.' });
    }
  };

  const handleSubmitModal = async (formData) => {
    setSubmitting(true);
    try {
      if (editingAccount) {
        await accountAPI.update(editingAccount._id, formData);
        setToast({ type: 'success', message: 'Account updated successfully.' });
      } else {
        await accountAPI.create(formData);
        setToast({ type: 'success', message: 'Account created successfully.' });
      }
      setIsModalOpen(false);
      fetchAccounts();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Action failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAccount) return;
    setSubmitting(true);
    try {
      await accountAPI.delete(deletingAccount._id);
      setToast({ type: 'success', message: 'Account deleted.' });
      setDeletingAccount(null);
      fetchAccounts();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to delete account' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalNetWorth = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);

  if (loading) return <Loading message="Loading financial accounts..." />;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total Net Worth: <span className="font-extrabold text-slate-900">{formatCurrency(totalNetWorth)}</span>
          </p>
        </div>
        <Button onClick={handleOpenAddModal} variant="primary" icon={Plus}>
          Add Account
        </Button>
      </div>

      {/* Account Grid */}
      {accounts.length === 0 ? (
        <EmptyState
          icon={WalletCards}
          title="No accounts yet."
          description="Create your bank, savings, or wallet accounts to track balances automatically."
          actionText="Add your first account"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((account) => (
            <AccountCard
              key={account._id}
              account={account}
              onEdit={handleOpenEditModal}
              onDelete={(acc) => setDeletingAccount(acc)}
              onView={handleViewAccount}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingAccount}
        loading={submitting}
      />

      {/* Account Detail & Transactions Modal */}
      {viewingAccountDetails && (
        <Modal
          isOpen={!!viewingAccountDetails}
          onClose={() => setViewingAccountDetails(null)}
          title={`${viewingAccountDetails.accountName} Details`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Current Balance</span>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {formatCurrency(viewingAccountDetails.balance)}
                </h3>
              </div>
              <span className="px-3 py-1 bg-white text-slate-700 text-xs font-bold rounded-full border border-slate-200 shadow-sm">
                {viewingAccountDetails.accountType}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Recent Transactions for this Account
              </h4>
              {accountTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No transactions recorded yet.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
                  {accountTransactions.map((tx) => {
                    const isIncome = tx.transactionType === 'Income';
                    return (
                      <div key={tx._id} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {isIncome ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4 text-rose-600" />
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{tx.description || tx.categoryID?.categoryName}</p>
                            <p className="text-[10px] text-slate-400">{formatDate(tx.transactionDate)}</p>
                          </div>
                        </div>
                        <span className={`font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingAccount}
        onClose={() => setDeletingAccount(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Account?"
        message={`Are you sure you want to delete "${deletingAccount?.accountName}"? All associated transactions will also be removed.`}
        loading={submitting}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Accounts;
