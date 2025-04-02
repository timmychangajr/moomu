import { ranum } from "@/app/lib/utils";
import { defaultMelody } from "@/services/melody";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// export async function POST(req: NextRequest, res: NextResponse) {
//     const defaultMelody = Array.from({ length: ranum(50, 8) }, () => ({
//         note: ALL_NOTES[ranum(ALL_NOTES.length)],
//         interval: ranum(500, 100),
//     }));
//     return NextResponse.json(
//         { melody: defaultMelody },
//         {
//             status: 200,
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         }
//     );
// }

//AI Melody Generation
export async function POST(req: NextRequest) {
    const { mood } = await req.json()
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key is missing' },
            { status: 500 }
        );
    }

    const openai = new OpenAI({
        apiKey,
        baseURL: "https://api.anthropic.com/v1/",
    });

    const response = await openai.chat.completions.create({
        messages: [
            {
                role: "user",
                content: 'give me a unique melody to try. ' +
                    'make sure it represents mood: ' + mood +
                    '. Return raw array value of notes with the following format: ' +
                    'note: string, interval: milliseconds' +
                    'No extra text, no explanation, no comments. no line breaks. '
            },
        ],
        response_format: { type: "json_object" },
        model: "claude-3-7-sonnet-20250219",
    })
    const melody = JSON.parse(response?.choices?.[0]?.message?.content || 'null');
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
