import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import onboardingGif from "../assets/onboarding.gif";
// import createPostGif from "../assets/create-post.gif"; //  Ny GIF til step 3

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
      setStep(2); // 🆕 Går til step 3
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <motion.div
        key={isOpen ? "modal-open" : "modal-closed"} // Force re-render on open
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        {/* Decorative background circles - matching your ColorCircle style */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100 rounded-full opacity-30 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-100 rounded-full opacity-30 blur-2xl" />

        {/* Content wrapper with relative positioning */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                {/* Welcome icon/emoji */}
                <div className="text-6xl mb-4 text-center">👋</div>

                <h2 className="text-3xl font-bold text-(--secondary) mb-4 text-center overskrift">
                  Velkommen til Friengers!
                </h2>

                <p className="text-(--secondary) text-center mb-6 leading-relaxed">
                  Friengers er din platform til at finde og hjælpe med opgaver
                  på AU. Få hjælp til at flytte en sofa, find en studiegruppe,
                  eller del dine skills med andre studerende.
                </p>

                <div className="bg-blue-50 border-l-4 border-(--primary) p-4 rounded-lg mb-6">
                  <p className="text-sm text-(--secondary)">
                    💡 <strong>Pro tip:</strong> Jo mere du hjælper andre, jo
                    lettere bliver det at møde nye mennesker!
                  </p>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                <h2 className="text-2xl font-bold text-(--secondary) mb-4 text-center overskrift">
                  Sådan fungerer Feed'et
                </h2>

                {/* GIF animation */}
                <div className="bg-gray-100 rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
                  <img
                    src={onboardingGif}
                    alt="Feed tutorial animation"
                    className="w-full h-auto object-contain rounded-2xl"
                    onError={(e) => {
                      console.error("GIF kunne ikke loades");
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `
                        <div class="text-center p-6">
                          <div class="text-4xl mb-2">📱</div>
                          <p class="text-sm text-gray-600">Kunne ikke loade animation</p>
                        </div>
                      `;
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-(--primary) text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <p className="text-sm text-(--secondary)">
                      Tryk på et opslag for at se alle detaljer
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-(--primary) text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <p className="text-sm text-(--secondary)">
                      Anmod om at deltage eller opret dit eget opslag
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-(--primary) text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <p className="text-sm text-(--secondary)">
                      Chat med andre deltagere når du er godkendt
                    </p>
                  </div>
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
                className="flex flex-col"
              >
                <h2 className="text-2xl font-bold text-(--secondary) mb-4 text-center overskrift">
                  Opret dit eget opslag
                </h2>

                {/* Create Post GIF animation */}
                <div className="bg-(--white) rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
                  <img
                    // src={createPostGif}
                    alt="Opret opslag tutorial"
                    className="w-full h-auto object-contain rounded-2xl"
                    onError={(e) => {
                      console.error("Create post GIF kunne ikke loades");
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `
                        <div class="text-center p-6">
                          <div class="text-4xl mb-2">✏️</div>
                          <p class="text-sm text-gray-600">Kunne ikke loade animation</p>
                        </div>
                      `;
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-(--primary) text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <p className="text-sm text-(--secondary)">
                      Tryk på "+" knappen for at oprette et nyt opslag
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-(--primary) text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <p className="text-sm text-(--secondary)">
                      Udfyld titel, beskrivelse, lokation og vælg tags
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-(--primary) text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <p className="text-sm text-(--secondary)">
                      Tilføj billeder hvis relevant og godkend anmodninger fra
                      interesserede
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex gap-3 mt-8">
            {step === 0 && (
              <button
                onClick={handleSkip}
                className="flex-1 py-3 px-6 rounded-full font-semibold text-(--secondary) border-2 border-(--secondary) transition-all hover:bg-gray-50"
              >
                Spring over
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-6 rounded-full font-semibold bg-(--primary) text-white transition-all hover:bg-opacity-90 shadow-lg"
            >
              {step === 2 ? "Forstået" : "Næste"}
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex justify-center items-center gap-2 mt-6">
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
      </motion.div>
    </div>
  );
}
