import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import onboardVideo1 from "../assets/apply-onboarding.webm";
import onboardVideo2 from "../assets/post-onboarding.webm";

export default function OnboardingModal({ isOpen, onFinish }) {
  const [step, setStep] = useState(0);

  // Reset step til 0 hver gang modal åbnes
  useEffect(() => {
    if (isOpen) {
      setStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else {
      onFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <motion.div
        key={isOpen ? "modal-open" : "modal-closed"}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-(--white) rounded-3xl max-w-md w-full shadow-2xl relative"
        style={{
          height: "520px", // 🎯 FIXED højde - ingen hopping!
          overflow: "hidden",
        }}
      >
        {/* Decorative background circles */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100 rounded-full opacity-30 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-100 rounded-full opacity-30 blur-2xl" />

        {/* Content wrapper - FIXED layout */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Main content area - FIXED space for content */}
          <div
            className="flex-shrink-0 flex flex-col justify-center px-8"
            style={{ height: "400px" }} // 🎯 FIXED content area
          >
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col justify-center"
                >
                  {/* Welcome icon/emoji */}
                  <div className="text-5xl mb-3 text-center">👋</div>

                  <h2 className="text-2xl font-bold text-(--secondary) mb-3 text-center overskrift">
                    Velkommen til Friengers!
                  </h2>

                  <p className="text-(--secondary) text-center text-sm leading-relaxed">
                    Platformen hvor AU-studerende hjælper hinanden, deler skills
                    og mødes over små og store opgaver. Flyt en sofa, find en
                    studiegruppe, eller start en aktivitet og måske møder du nye
                    venner undervejs!
                  </p>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col justify-center"
                >
                  <h2 className="text-xl font-bold text-(--secondary) mb-3 text-center overskrift">
                    Dit feed, dit fælleskab
                  </h2>

                  {/* Video container */}
                  <div
                    className="relative w-full rounded-2xl overflow-hidden bg-(--white)"
                    style={{ height: "300px" }}
                  >
                    <video
                      src={onboardVideo1}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      onError={(e) => {
                        console.error("WebM kunne ikke loades");
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.innerHTML = `
                            <div class="flex items-center justify-center h-full">
                              <div class="text-center p-6">
                                <div class="text-4xl mb-2">📱</div>
                                <p class="text-sm text-gray-600">Kunne ikke loade animation</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col justify-center"
                >
                  <h2 className="text-xl font-bold text-(--secondary) mb-3 text-center overskrift">
                    Din idé, dit opslag!
                  </h2>

                  {/* Image container - samme størrelse som video */}
                  <div
                    className="relative w-full rounded-2xl overflow-hidden bg-(--white)"
                    style={{ height: "300px" }}
                  >
                    <video
                      src={onboardVideo2}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      onError={(e) => {
                        console.error("WebM kunne ikke loades");
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.innerHTML = `
                            <div class="flex items-center justify-center h-full">
                              <div class="text-center p-6">
                                <div class="text-4xl mb-2">📱</div>
                                <p class="text-sm text-gray-600">Kunne ikke loade animation</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom section - FIXED height for buttons + indicator */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-end pb-6"
            style={{ height: "120px" }} // 🎯 FIXED bottom area
          >
            {/* Action buttons - CENTERED with fixed gap */}
            <div className="flex justify-center items-center gap-3 mb-4">
              {/* Left button - morphs from "Skip" to back arrow */}
              <AnimatePresence mode="wait">
                {step === 0 ? (
                  <motion.button
                    key="skip"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleSkip}
                    className="h-12 px-6 rounded-full font-semibold text-(--secondary) border-2 border-(--secondary) transition-all hover:bg-gray-50"
                  >
                    Spring over
                  </motion.button>
                ) : (
                  <motion.button
                    key="back"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleBack}
                    className="flex-shrink-0 w-12 h-12 rounded-full font-semibold border-2 border-(--secondary) text-(--secondary) transition-all hover:bg-gray-50 flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Right button - morphs from arrow to "Forstået" */}
              <AnimatePresence mode="wait">
                {step === 2 ? (
                  <motion.button
                    key="finish"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleNext}
                    className="h-12 px-6 rounded-full font-semibold bg-(--primary) text-white transition-all hover:bg-opacity-90 shadow-lg"
                  >
                    Forstået
                  </motion.button>
                ) : (
                  <motion.button
                    key="next"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleNext}
                    className="flex-shrink-0 w-12 h-12 rounded-full font-semibold bg-(--primary) text-white transition-all hover:bg-opacity-90 shadow-lg flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Step indicator */}
            <div className="flex justify-center items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full transition-all ${
                  step === 0 ? "bg-(--primary) w-6" : "bg-gray-300"
                }`}
              />
              <div
                className={`h-2 w-2 rounded-full transition-all ${
                  step === 1 ? "bg-(--primary) w-6" : "bg-gray-300"
                }`}
              />
              <div
                className={`h-2 w-2 rounded-full transition-all ${
                  step === 2 ? "bg-(--primary) w-6" : "bg-gray-300"
                }`}
              />
              <span className="ml-2 text-sm text-gray-500 font-medium">
                {step + 1}/3
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
