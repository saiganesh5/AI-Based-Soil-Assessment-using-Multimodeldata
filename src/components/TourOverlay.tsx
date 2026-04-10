import { useEffect, useState, useRef, useCallback } from 'react';
import { useTour } from '../context/TourContext';

/* ===============================
   TOUR OVERLAY COMPONENT
   Renders spotlight cutout + tooltip
================================ */
export default function TourOverlay(): React.JSX.Element | null {
    const { isTourActive, currentStepIndex, tourSteps, nextStep, prevStep, endTour } = useTour();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const currentStep = tourSteps[currentStepIndex];

    // Calculate and update target element position
    const updateTargetRect = useCallback(() => {
        if (!currentStep) return;
        const el = document.querySelector(currentStep.target);
        if (el) {
            const rect = el.getBoundingClientRect();
            setTargetRect(rect);

            // Auto-scroll element into view
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } else {
            setTargetRect(null);
        }
    }, [currentStep]);

    // Re-calculate position on step change and window resize
    useEffect(() => {
        if (!isTourActive || !currentStep) return;

        setIsTransitioning(true);
        // Small delay so scroll can finish
        const timer = setTimeout(() => {
            updateTargetRect();
            setIsTransitioning(false);
        }, 400);

        window.addEventListener('resize', updateTargetRect);
        window.addEventListener('scroll', updateTargetRect, true);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateTargetRect);
            window.removeEventListener('scroll', updateTargetRect, true);
        };
    }, [isTourActive, currentStep, updateTargetRect]);

    // Position tooltip based on target rect
    useEffect(() => {
        if (!targetRect || !tooltipRef.current) return;

        const tooltipEl = tooltipRef.current;
        const tooltipWidth = tooltipEl.offsetWidth || 340;
        const tooltipHeight = tooltipEl.offsetHeight || 200;
        const padding = 16;
        const gap = 14;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let top = 0;
        let left = 0;
        let pos: 'top' | 'bottom' | 'left' | 'right' = currentStep?.position || 'bottom';

        // Calculate center-x of target
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        // Try preferred position, then fallback
        const tryPosition = (p: typeof pos): boolean => {
            switch (p) {
                case 'bottom':
                    top = targetRect.bottom + gap;
                    left = targetCenterX - tooltipWidth / 2;
                    return top + tooltipHeight < vh - padding;
                case 'top':
                    top = targetRect.top - tooltipHeight - gap;
                    left = targetCenterX - tooltipWidth / 2;
                    return top > padding;
                case 'right':
                    top = targetCenterY - tooltipHeight / 2;
                    left = targetRect.right + gap;
                    return left + tooltipWidth < vw - padding;
                case 'left':
                    top = targetCenterY - tooltipHeight / 2;
                    left = targetRect.left - tooltipWidth - gap;
                    return left > padding;
                default:
                    return false;
            }
        };

        if (!tryPosition(pos)) {
            // Fallback order
            const fallbacks: typeof pos[] = ['bottom', 'top', 'right', 'left'];
            for (const fb of fallbacks) {
                if (fb !== pos && tryPosition(fb)) {
                    pos = fb;
                    break;
                }
            }
        }

        // Clamp to viewport
        left = Math.max(padding, Math.min(left, vw - tooltipWidth - padding));
        top = Math.max(padding, Math.min(top, vh - tooltipHeight - padding));

        setArrowPosition(pos);
        setTooltipStyle({
            top: `${top}px`,
            left: `${left}px`,
        });
    }, [targetRect, currentStep?.position]);

    // Keyboard navigation
    useEffect(() => {
        if (!isTourActive) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') endTour();
            if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
            if (e.key === 'ArrowLeft') prevStep();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isTourActive, endTour, nextStep, prevStep]);

    if (!isTourActive || !currentStep) return null;

    const spotlightPadding = 8;
    const spotlightRadius = 12;


    // Use box-shadow approach for spotlight cutout
    const getOverlayStyle = (): React.CSSProperties => {
        if (!targetRect) {
            return { background: 'rgba(0, 0, 0, 0.6)' };
        }
        return {
            background: 'transparent',
            boxShadow: `
                0 0 0 9999px rgba(0, 0, 0, 0.55),
                0 0 20px 4px rgba(0, 0, 0, 0.2)
            `,
            top: `${targetRect.top - spotlightPadding}px`,
            left: `${targetRect.left - spotlightPadding}px`,
            width: `${targetRect.width + spotlightPadding * 2}px`,
            height: `${targetRect.height + spotlightPadding * 2}px`,
            borderRadius: `${spotlightRadius}px`,
            position: 'fixed' as const,
            zIndex: 10000,
            pointerEvents: 'none' as const,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        };
    };

    const arrowDir = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
    }[arrowPosition] as string;

    return (
        <>
            {/* Inline styles for animations */}
            <style>{`
                @keyframes tour-fade-in {
                    from { opacity: 0; transform: translateY(8px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes tour-pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
                    70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                .tour-tooltip {
                    animation: tour-fade-in 0.35s ease-out;
                }
                .tour-spotlight {
                    animation: tour-pulse-ring 2s ease-in-out infinite;
                }
            `}</style>

            {/* Click-blocker overlay (full screen) */}
            <div
                className="fixed inset-0 z-[9999]"
                style={{ cursor: 'default' }}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            />

            {/* Spotlight cutout */}
            <div
                className="tour-spotlight"
                style={getOverlayStyle()}
            />

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className={`tour-tooltip fixed z-[10001] w-[340px] max-w-[90vw] transition-all duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
                style={tooltipStyle}
            >
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                    {/* Progress bar */}
                    <div className="h-1 bg-gray-100 dark:bg-slate-700">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500 rounded-full"
                            style={{ width: `${((currentStepIndex + 1) / tourSteps.length) * 100}%` }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        {/* Step counter */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                Step {currentStepIndex + 1} of {tourSteps.length}
                            </span>
                            <button
                                onClick={endTour}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all bg-transparent border-none cursor-pointer text-xs"
                                aria-label="Close tour"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                            {currentStep.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-5">
                            {currentStep.description}
                        </p>

                        {/* Navigation buttons */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={endTour}
                                className="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 bg-transparent border-none cursor-pointer transition-colors py-1 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                                Skip Tour
                            </button>
                            <div className="flex gap-2">
                                {currentStepIndex > 0 && (
                                    <button
                                        onClick={prevStep}
                                        className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 border-none cursor-pointer transition-all"
                                    >
                                        ← Back
                                    </button>
                                )}
                                <button
                                    onClick={nextStep}
                                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-400 hover:to-green-400 border-none cursor-pointer transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                                >
                                    {currentStepIndex === tourSteps.length - 1 ? 'Finish ✓' : 'Next →'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step dots */}
                    <div className="flex items-center justify-center gap-1.5 pb-4">
                        {tourSteps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`rounded-full transition-all duration-300 ${idx === currentStepIndex
                                        ? 'w-6 h-2 bg-emerald-500'
                                        : idx < currentStepIndex
                                            ? 'w-2 h-2 bg-emerald-300 dark:bg-emerald-700'
                                            : 'w-2 h-2 bg-gray-200 dark:bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Arrow */}
                <div
                    className="absolute w-3 h-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rotate-45"
                    style={{
                        ...(arrowDir === 'top' && { top: '-7px', left: '50%', marginLeft: '-6px', borderBottom: 'none', borderRight: 'none' }),
                        ...(arrowDir === 'bottom' && { bottom: '-7px', left: '50%', marginLeft: '-6px', borderTop: 'none', borderLeft: 'none' }),
                        ...(arrowDir === 'left' && { left: '-7px', top: '50%', marginTop: '-6px', borderTop: 'none', borderRight: 'none' }),
                        ...(arrowDir === 'right' && { right: '-7px', top: '50%', marginTop: '-6px', borderBottom: 'none', borderLeft: 'none' }),
                    }}
                />
            </div>
        </>
    );
}
