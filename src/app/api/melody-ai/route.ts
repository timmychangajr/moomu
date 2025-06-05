import { defaultMelody } from "@/services/melody";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from '@google/genai';

//AI Melody Generation
export async function POST(req: NextRequest) {
    const { mood } = await req.json()
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key is missing' },
            { status: 500 }
        );
    }

    const gemini = new GoogleGenAI({ apiKey });

    const response = await gemini.models.generateContent({
        model: 'gemini-2.0-flash-exp-image-generation',
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        'note': {
                            type: Type.STRING,
                            description: 'Interpretation/Story/Summary',
                            nullable: false,
                        },
                        'interval': {
                            type: Type.NUMBER,
                            description: 'interval between notes in milliseconds',
                            nullable: false,
                        },
                    },
                    required: ['note', 'interval']
                }
            },
        },
        contents: 'give me a unique melody to try. ' +
            'make sure it represents mood: ' + mood +
            '. Return raw array value of notes with the following format: ' +
            'note: string, interval: milliseconds' +
            'No extra text, no explanation, no comments. no line breaks. '
    })
    let melody = defaultMelody
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text === "string") {
        try {
            melody = JSON.parse(text);
        } catch {
            melody = defaultMelody;
        }
    }
    return NextResponse.json(
        { melody: melody?.length ? melody : defaultMelody },
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
}
