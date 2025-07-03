
import { SavedJourney } from '../types.ts';

const JOURNEYS_KEY = 'eod-journeys';

export const getJourneys = (): SavedJourney[] => {
    try {
        const journeysJSON = localStorage.getItem(JOURNEYS_KEY);
        if (!journeysJSON) {
            return [];
        }
        const journeys = JSON.parse(journeysJSON) as SavedJourney[];
        // Sort by date, newest first
        return journeys.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
    } catch (error) {
        console.error("Failed to parse journeys from localStorage", error);
        return [];
    }
};

export const addJourney = (journey: SavedJourney): void => {
    const journeys = getJourneys();
    journeys.unshift(journey); // Add to the beginning
    localStorage.setItem(JOURNEYS_KEY, JSON.stringify(journeys));
};

export const deleteJourney = (journeyId: string): void => {
    let journeys = getJourneys();
    journeys = journeys.filter(j => j.id !== journeyId);
    localStorage.setItem(JOURNEYS_KEY, JSON.stringify(journeys));
};
