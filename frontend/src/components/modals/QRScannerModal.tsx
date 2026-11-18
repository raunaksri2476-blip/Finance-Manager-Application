import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Flashlight, RefreshCw, CheckCircle2 } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (merchant: string, amount: number) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [torchOn, setTorchOn] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleSimulateScan = () => {
    setScanned(true);
    setTimeout(() => {
      onScanSuccess('Blue Bottle Coffee & Bakery', 8.75);
      setScanned(false);
      onClose();
    }, 1100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="w-full max-w-[380px] bg-[#141417] border border-zinc-800 rounded-[32px] p-6 shadow-2xl flex flex-col items-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Controls */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-400" />
                <span className="text-white font-semibold text-sm">Scan QR to Pay</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Viewfinder simulation with continuous animated laser line */}
            <div className="relative w-64 h-64 rounded-3xl bg-zinc-950 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden my-4">
              {/* Continuous Laser scanning beam */}
              {!scanned && (
                <motion.div 
                  animate={{ y: [-110, 110, -110] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-400 to-purple-500 shadow-[0_0_20px_#a855f7]" 
                />
              )}

              {/* Corner Guides */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-purple-400" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-purple-400" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-purple-400" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-purple-400" />

              {scanned ? (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center text-emerald-400"
                >
                  <CheckCircle2 className="w-14 h-14 mb-2 animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-wider">Merchant Verified</span>
                </motion.div>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
                    <QrCode className="w-6 h-6 text-zinc-500" />
                  </div>
                  <p className="text-zinc-500 text-xs">Align QR code inside the frame to scan</p>
                </div>
              )}
            </div>

            {/* Action Controls */}
            <div className="w-full flex items-center justify-center gap-4 mt-2 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setTorchOn(!torchOn)}
                className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
                  torchOn 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
              >
                <Flashlight className="w-3.5 h-3.5" />
                <span>{torchOn ? 'Torch On' : 'Torch Off'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleSimulateScan}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simulate Scan</span>
              </motion.button>
            </div>

            <p className="text-zinc-500 text-[11px] text-center">
              Supports merchant checkout, peer-to-peer bill splitting, and receipt scanning.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
