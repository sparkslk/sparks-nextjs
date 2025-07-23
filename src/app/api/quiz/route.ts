import { NextRequest, NextResponse } from 'next/server';
import { submitQuiz, saveQuizProgress } from '../../quiz/actions';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const result = await submitQuiz(formData);

        return NextResponse.json(result);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error'
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const formData = await request.formData();
        const result = await saveQuizProgress(formData);

        return NextResponse.json(result);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error'
            },
            { status: 500 }
        );
    }
}
