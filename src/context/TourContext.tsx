import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

/* ===============================
   TYPES
================================ */
export interface TourStep {
    /** CSS selector for the target element (e.g. '#upload-card') */
    target: string;
    /** Title of the step */
    title: string;
    /** Description of the step */
    description: string;
    /** Preferred tooltip position relative to target */
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
    /** Whether a tour is currently active */
    isTourActive: boolean;
    /** Current step index (0-based) */
    currentStepIndex: number;
    /** Steps for the current tour */
    tourSteps: TourStep[];
    /** Start a tour with the given steps */
    startTour: (steps: TourStep[]) => void;
    /** Go to the next step */
    nextStep: () => void;
    /** Go to the previous step */
    prevStep: () => void;
    /** End/skip the tour */
    endTour: () => void;
    /** Check if a specific page tour has been completed for the current user */
    isPageTourDone: (pageKey: string) => boolean;
    /** Mark a page tour as done */
    markPageTourDone: (pageKey: string) => void;
    /** Reset a page tour (for re-launch) */
    resetPageTour: (pageKey: string) => void;
    /** The current page key being toured */
    currentPageKey: string | null;
    /** Start a tour for a specific page (checks completion, sets page key) */
    startPageTour: (pageKey: string, steps: TourStep[]) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function useTour(): TourContextType {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
}

/* ===============================
   HELPERS — per-user localStorage
================================ */
function getTourStorageKey(userEmail: string, pageKey: string): string {
    return `tour_${userEmail}_${pageKey}_done`;
}

function checkPageTourDone(userEmail: string | null, pageKey: string): boolean {
    if (!userEmail) return false;
    return localStorage.getItem(getTourStorageKey(userEmail, pageKey)) === 'true';
}

function setPageTourDone(userEmail: string | null, pageKey: string): void {
    if (!userEmail) return;
    localStorage.setItem(getTourStorageKey(userEmail, pageKey), 'true');
}

function clearPageTourDone(userEmail: string | null, pageKey: string): void {
    if (!userEmail) return;
    localStorage.removeItem(getTourStorageKey(userEmail, pageKey));
}

/* ===============================
   PROVIDER
================================ */
interface TourProviderProps {
    children: React.ReactNode;
}

export function TourProvider({ children }: TourProviderProps): React.JSX.Element {
    const { currentUser } = useAuth();
    const userEmail = currentUser?.email ?? null;

    const [isTourActive, setIsTourActive] = useState<boolean>(false);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
    const [currentPageKey, setCurrentPageKey] = useState<string | null>(null);

    // Lock body scroll when tour is active
    useEffect(() => {
        if (isTourActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isTourActive]);

    const startTour = useCallback((steps: TourStep[]) => {
        if (steps.length === 0) return;
        setTourSteps(steps);
        setCurrentStepIndex(0);
        setIsTourActive(true);
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStepIndex(prev => {
            if (prev >= tourSteps.length - 1) {
                // Tour finished
                setIsTourActive(false);
                if (currentPageKey) {
                    setPageTourDone(userEmail, currentPageKey);
                }
                setCurrentPageKey(null);
                return 0;
            }
            return prev + 1;
        });
    }, [tourSteps.length, currentPageKey, userEmail]);

    const prevStep = useCallback(() => {
        setCurrentStepIndex(prev => Math.max(0, prev - 1));
    }, []);

    const endTour = useCallback(() => {
        setIsTourActive(false);
        if (currentPageKey) {
            setPageTourDone(userEmail, currentPageKey);
        }
        setCurrentPageKey(null);
        setCurrentStepIndex(0);
    }, [currentPageKey, userEmail]);

    const isPageTourDone = useCallback((pageKey: string): boolean => {
        return checkPageTourDone(userEmail, pageKey);
    }, [userEmail]);

    const markPageTourDone = useCallback((pageKey: string): void => {
        setPageTourDone(userEmail, pageKey);
    }, [userEmail]);

    const resetPageTour = useCallback((pageKey: string): void => {
        clearPageTourDone(userEmail, pageKey);
    }, [userEmail]);

    const startPageTour = useCallback((pageKey: string, steps: TourStep[]) => {
        setCurrentPageKey(pageKey);
        startTour(steps);
    }, [startTour]);

    const value: TourContextType = {
        isTourActive,
        currentStepIndex,
        tourSteps,
        startTour,
        nextStep,
        prevStep,
        endTour,
        isPageTourDone,
        markPageTourDone,
        resetPageTour,
        currentPageKey,
        startPageTour,
    };

    return (
        <TourContext.Provider value={value}>
            {children}
        </TourContext.Provider>
    );
}
