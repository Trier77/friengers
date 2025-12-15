import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function AnmeldelsesModal({ isOpen, onClose, reportedUserName }) {
  const [reason, setReason] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  const handleClose = () => {
    setReason("");
    setText("");
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-0 bottom-0 w-screen bg-white z-500 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {!submitted ? (
              <>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-(--secondary) font-bold text-xl">
                    {t(`report.title`, {name: reportedUserName} )}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-gray-500 text-sm mb-6">
                  {t(`report.helpText`)}
                </p>

                {/* Dropdown */}
                <select
                  className="w-full border-2 border-(--secondary) rounded-full p-3 mb-4 text-(--secondary) font-semibold focus:outline-none focus:border-(--secondary)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="">{t(`report.selectPlaceholder`)}</option>
                  <option value="Chikane">{t(`report.reason.harassment`)}</option>
                  <option value="Upassende adfærd">{t(`report.reason.inappropriate`)}</option>
                  <option value="Spam">{t(`report.reason.spam`)}</option>
                  <option value="Andet">{t(`report.reason.other`)}</option>
                </select>

                {/* Textarea */}
                <textarea
                  className="w-full border-2 border-gray-200 rounded-2xl p-4 mb-6 text-(--secondary) focus:outline-none focus:border-(--secondary) resize-none"
                  placeholder={t(`report.textPlaceholder`)}
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
                  >
                    {t(`report.cancel`)}
                  </button>
                  <button
                    disabled={!reason}
                    onClick={() => setSubmitted(true)}
                    className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-full hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                   {t(`report.submit`)}
                  </button>
                </div>
              </>
            ) : (
              /* Success screen */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <h3 className="text-(--secondary) font-bold text-xl mb-2">
                  {t(`report.successTitle`)}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {t(`report.successText`)}
                </p>

                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-(--secondary) text-white font-semibold rounded-full hover:brightness-110 transition-all"
                >
                  {t(`report.close`)}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AnmeldelsesModal;
