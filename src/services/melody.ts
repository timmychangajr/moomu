import { defaultMelody } from "@/app/api/melody-ai/route";

export interface Note {
    note: string;
    interval: number;
}

export interface Melody {
    name: string;
    notes: Note[];
}

export default async function fetchMelody(mood: string) {
    let melody: Note[] = [];
    await fetch('/api/melody-ai', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ mood }) 
    })
        .then((response) => {
            if (!response.ok) {
                console.info('Response not ok', response);
                return {melody: defaultMelody};
            }
            return response.json();
        })
        .then((data) => {
            melody = data?.melody;
            return data;
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
            return null;
        });
    return melody;
}