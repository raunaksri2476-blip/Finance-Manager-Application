import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '../Header';
import { WalletCard } from '../WalletCard';
import { QuickMetrics } from '../QuickMetrics';
import { ActionGrid } from '../ActionGrid';
import { ReferBanner } from '../ReferBanner';
import { RecentTransactions } from '../RecentTransactions';
import { AccountCard, BudgetCategory, CashbackPartner, Transaction } from '../../types';

interface HomeViewProps {
  card: AccountCard;
  allCards: AccountCard[];
  onSelectCard: (card: AccountCard) => void;
  categories: BudgetCategory[];
  cashbackPartners: CashbackPartner[];
  transactions: Transaction[];
  onQRClick: () => void;
  onAddTransactionClick: () => void;
  onTipsClick: () => void;
  onServicesClick: () => void;
  onReferralClick: () => void;
  onSpendingClick: () => void;
  onCashbackClick: () => void;
  onSeeAllTransactions: () => void;
  onTransactionClick: (tx: Transaction) => void;
  onProfileClick: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  card,
  allCards,
  onSelectCard,
  categories,
  cashbackPartners,
  transactions,
  onQRClick,
  onAddTransactionClick,
  onTipsClick,
  onServicesClick,
  onReferralClick,
  onSpendingClick,
  onCashbackClick,
  onSeeAllTransactions,
  onTransactionClick,
  onProfileClick,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="pb-20 select-none"
    >
      {/* Top App Header */}
      <Header
        onSearchClick={onSeeAllTransactions}
        onNotificationClick={onTipsClick}
        onProfileClick={onProfileClick}
      />

      {/* Main Wallet Card */}
      <WalletCard
        card={card}
        allCards={allCards}
        onSelectCard={onSelectCard}
        onAddCardClick={onAddTransactionClick}
      />

      {/* Side-by-Side Quick Metrics (Spending Pills & Cash Back) */}
      <QuickMetrics
        categories={categories}
        cashbackPartners={cashbackPartners}
        onSpendingClick={onSpendingClick}
        onCashbackClick={onCashbackClick}
      />

      {/* 4-Item Unique Action Grid (QR, +, Tips, Services) */}
      <ActionGrid
        onQRClick={onQRClick}
        onAddClick={onAddTransactionClick}
        onTipsClick={onTipsClick}
        onServicesClick={onServicesClick}
      />

      {/* Refer and Earn Banner */}
      <ReferBanner onLearnMoreClick={onReferralClick} />

      {/* Recent Activity List */}
      <RecentTransactions
        transactions={transactions}
        onSeeAllClick={onSeeAllTransactions}
        onTransactionClick={onTransactionClick}
      />
    </motion.div>
  );
};
