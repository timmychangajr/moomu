
export interface Note {
    note: string;
    interval: number;
}

export interface Melody {
    name: string;
    notes: Note[];
}

export default async function fetchMelody() {
    let melody: Note[] = [];
    await fetch('/api/melody-ai')
        .then((response) => {
            if (!response.ok) {
                console.info('Response not ok', response);
                throw new Error('Network response was not ok');
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