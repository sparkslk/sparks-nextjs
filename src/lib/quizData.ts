import {
    FaMale,
    FaFemale,
    FaGenderless,
    FaBatteryEmpty,
    FaCloud,
    FaSun,
    FaSmile,
    FaFrown,
    FaMeh,
    FaRunning,
    FaSwimmer,
    FaBiking,
    FaDumbbell,
    FaWalking,
    FaAppleAlt,
    FaCarrot,
    FaFish,
    FaLeaf,
    FaWater,
    FaOm,
    FaMusic,
    FaBook,
    FaSpa,
    FaBed,
    FaUsers,
    FaGamepad,
    FaFilm,
    FaGraduationCap,
    FaChartLine,
    FaPaintBrush,
    FaBriefcase,
    FaHeart,
    FaHandsHelping,
    FaUserFriends,
} from 'react-icons/fa';
import { ElementType } from 'react';

export interface QuizQuestion {
    id: number;
    question: string;
    description?: string;
    inputType: 'radio' | 'checkbox' | 'text' | 'number' | 'rating' | 'textarea';
    options?: { value: string; label: string; icon?: ElementType }[];
    fieldName: string;
    category: 'personal' | 'wellbeing' | 'habits' | 'program';
}

export const quizQuestions: QuizQuestion[] = [
    // Step 1: Personal Information
    {
        id: 1,
        question: "What's your gender and age?",
        description: "This helps us personalize your well-being plan",
        inputType: 'radio',
        fieldName: 'gender',
        category: 'personal',
        options: [
            { value: 'male', label: 'Male', icon: FaMale },
            { value: 'female', label: 'Female', icon: FaFemale },
            { value: 'non-binary', label: 'Non-binary', icon: FaGenderless },
            { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: FaGenderless }
        ]
    },

    // Steps 2-16: Well-being Assessment (1-5 scale)
    {
        id: 2,
        question: "How would you rate your current energy levels?",
        description: "1 = Very low, 5 = Very high",
        inputType: 'rating',
        fieldName: 'wellbeingQ1',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 3,
        question: "How would you rate your sleep quality?",
        description: "1 = Very poor, 5 = Excellent",
        inputType: 'rating',
        fieldName: 'wellbeingQ2',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 4,
        question: "How would you rate your current stress levels?",
        description: "1 = Very low stress, 5 = Very high stress",
        inputType: 'rating',
        fieldName: 'wellbeingQ3',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 5,
        question: "How would you rate your emotional balance?",
        description: "1 = Unstable, 5 = Very stable",
        inputType: 'rating',
        fieldName: 'wellbeingQ4',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 6,
        question: "How satisfied are you with your life currently?",
        description: "1 = Very dissatisfied, 5 = Very satisfied",
        inputType: 'rating',
        fieldName: 'wellbeingQ5',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 7,
        question: "How would you rate your physical health?",
        description: "1 = Poor, 5 = Excellent",
        inputType: 'rating',
        fieldName: 'wellbeingQ6',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 8,
        question: "How clear and focused is your thinking?",
        description: "1 = Unfocused, 5 = Very focused",
        inputType: 'rating',
        fieldName: 'wellbeingQ7',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 9,
        question: "How strong are your social connections?",
        description: "1 = Weak, 5 = Very strong",
        inputType: 'rating',
        fieldName: 'wellbeingQ8',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 10,
        question: "How balanced is your work-life situation?",
        description: "1 = Unbalanced, 5 = Very balanced",
        inputType: 'rating',
        fieldName: 'wellbeingQ9',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 11,
        question: "How confident do you feel about yourself?",
        description: "1 = Not confident, 5 = Very confident",
        inputType: 'rating',
        fieldName: 'wellbeingQ10',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 12,
        question: "How motivated do you feel in general?",
        description: "1 = Unmotivated, 5 = Very motivated",
        inputType: 'rating',
        fieldName: 'wellbeingQ11',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 13,
        question: "How well do you cope with challenges?",
        description: "1 = Poorly, 5 = Very well",
        inputType: 'rating',
        fieldName: 'wellbeingQ12',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 14,
        question: "How happy do you feel overall?",
        description: "1 = Unhappy, 5 = Very happy",
        inputType: 'rating',
        fieldName: 'wellbeingQ13',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 15,
        question: "How strong is your sense of purpose?",
        description: "1 = Weak, 5 = Very strong",
        inputType: 'rating',
        fieldName: 'wellbeingQ14',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },
    {
        id: 16,
        question: "How optimistic do you feel about your future?",
        description: "1 = Pessimistic, 5 = Very optimistic",
        inputType: 'rating',
        fieldName: 'wellbeingQ15',
        category: 'wellbeing',
        options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' }
        ]
    },

    // Steps 17-24: Habits and Goals
    {
        id: 17,
        question: "Which exercise activities do you enjoy or want to try?",
        description: "Select all that apply",
        inputType: 'checkbox',
        fieldName: 'exerciseHabits',
        category: 'habits',
        options: [
            { value: 'running', label: 'Running/Jogging', icon: FaRunning },
            { value: 'swimming', label: 'Swimming', icon: FaSwimmer },
            { value: 'cycling', label: 'Cycling', icon: FaBiking },
            { value: 'weight-training', label: 'Weight Training', icon: FaDumbbell },
            { value: 'walking', label: 'Walking', icon: FaWalking },
            { value: 'yoga', label: 'Yoga', icon: FaOm },
            { value: 'dancing', label: 'Dancing', icon: FaMusic },
            { value: 'sports', label: 'Team Sports', icon: FaGamepad },
            { value: 'hiking', label: 'Hiking', icon: FaWalking }
        ]
    },

    {
        id: 18,
        question: "What are your nutrition goals?",
        description: "Select all that apply",
        inputType: 'checkbox',
        fieldName: 'nutritionGoals',
        category: 'habits',
        options: [
            { value: 'more-vegetables', label: 'Eat More Vegetables', icon: FaCarrot },
            { value: 'less-processed', label: 'Reduce Processed Foods', icon: FaAppleAlt },
            { value: 'more-protein', label: 'Increase Protein', icon: FaFish },
            { value: 'healthy-fats', label: 'Add Healthy Fats', icon: FaLeaf },
            { value: 'hydration', label: 'Better Hydration', icon: FaWater },
            { value: 'portion-control', label: 'Portion Control', icon: FaAppleAlt },
            { value: 'meal-planning', label: 'Meal Planning', icon: FaBook },
            { value: 'mindful-eating', label: 'Mindful Eating', icon: FaOm }
        ]
    },

    {
        id: 19,
        question: "How do you prefer to manage stress?",
        description: "Select all that apply",
        inputType: 'checkbox',
        fieldName: 'stressManagement',
        category: 'habits',
        options: [
            { value: 'meditation', label: 'Meditation', icon: FaOm },
            { value: 'exercise', label: 'Physical Exercise', icon: FaRunning },
            { value: 'music', label: 'Listening to Music', icon: FaMusic },
            { value: 'reading', label: 'Reading', icon: FaBook },
            { value: 'nature', label: 'Time in Nature', icon: FaLeaf },
            { value: 'social', label: 'Talking to Friends', icon: FaUsers },
            { value: 'breathing', label: 'Breathing Exercises', icon: FaSpa },
            { value: 'creative', label: 'Creative Activities', icon: FaPaintBrush }
        ]
    },

    {
        id: 20,
        question: "What's your current sleep pattern?",
        description: "Choose the option that best describes you",
        inputType: 'radio',
        fieldName: 'sleepHabits',
        category: 'habits',
        options: [
            { value: 'early-bird', label: 'Early to bed, early to rise', icon: FaSun },
            { value: 'night-owl', label: 'Late to bed, late to rise', icon: FaCloud },
            { value: 'irregular', label: 'Irregular sleep schedule', icon: FaMeh },
            { value: 'good-routine', label: 'Consistent 7-8 hours', icon: FaBed },
            { value: 'poor-sleep', label: 'Often struggle with sleep', icon: FaFrown }
        ]
    },

    {
        id: 21,
        question: "What social activities energize you?",
        description: "Select all that apply",
        inputType: 'checkbox',
        fieldName: 'socialActivities',
        category: 'habits',
        options: [
            { value: 'group-fitness', label: 'Group Fitness Classes', icon: FaUsers },
            { value: 'game-nights', label: 'Game Nights', icon: FaGamepad },
            { value: 'movie-nights', label: 'Movie Nights', icon: FaFilm },
            { value: 'dining-out', label: 'Dining Out', icon: FaHeart },
            { value: 'volunteer', label: 'Volunteering', icon: FaHandsHelping },
            { value: 'hobby-groups', label: 'Hobby Groups', icon: FaUsers },
            { value: 'outdoor-activities', label: 'Outdoor Activities', icon: FaLeaf },
            { value: 'learning-together', label: 'Learning Together', icon: FaGraduationCap }
        ]
    },

    {
        id: 22,
        question: "What areas of personal growth interest you?",
        description: "Select all that apply",
        inputType: 'checkbox',
        fieldName: 'personalGrowth',
        category: 'habits',
        options: [
            { value: 'mindfulness', label: 'Mindfulness & Meditation', icon: FaOm },
            { value: 'learning-skills', label: 'Learning New Skills', icon: FaGraduationCap },
            { value: 'career-development', label: 'Career Development', icon: FaBriefcase },
            { value: 'creativity', label: 'Creative Expression', icon: FaPaintBrush },
            { value: 'emotional-intelligence', label: 'Emotional Intelligence', icon: FaHeart },
            { value: 'productivity', label: 'Productivity & Organization', icon: FaChartLine },
            { value: 'relationships', label: 'Better Relationships', icon: FaUserFriends },
            { value: 'self-reflection', label: 'Self-Reflection', icon: FaBook }
        ]
    },

    {
        id: 23,
        question: "How would you like to improve work-life balance?",
        description: "Select all that apply",
        inputType: 'checkbox',
        fieldName: 'workLifeBalance',
        category: 'habits',
        options: [
            { value: 'boundaries', label: 'Set Better Boundaries', icon: FaBriefcase },
            { value: 'time-management', label: 'Better Time Management', icon: FaChartLine },
            { value: 'breaks', label: 'Take Regular Breaks', icon: FaSpa },
            { value: 'hobbies', label: 'Pursue Hobbies', icon: FaPaintBrush },
            { value: 'family-time', label: 'More Family Time', icon: FaHeart },
            { value: 'relaxation', label: 'Relaxation Techniques', icon: FaOm },
            { value: 'exercise-schedule', label: 'Exercise Schedule', icon: FaRunning },
            { value: 'digital-detox', label: 'Digital Detox', icon: FaBook }
        ]
    },

    {
        id: 24,
        question: "Which mindfulness practices appeal to you?",
        description: "Select all that apply",
        inputType: 'checkbox',
        fieldName: 'mindfulnessPractices',
        category: 'habits',
        options: [
            { value: 'guided-meditation', label: 'Guided Meditation', icon: FaOm },
            { value: 'breathing-exercises', label: 'Breathing Exercises', icon: FaSpa },
            { value: 'body-scan', label: 'Body Scan Meditation', icon: FaHeart },
            { value: 'mindful-walking', label: 'Mindful Walking', icon: FaWalking },
            { value: 'journaling', label: 'Mindful Journaling', icon: FaBook },
            { value: 'gratitude', label: 'Gratitude Practice', icon: FaSmile },
            { value: 'visualization', label: 'Visualization', icon: FaCloud },
            { value: 'mindful-eating', label: 'Mindful Eating', icon: FaAppleAlt }
        ]
    },

    // Steps 25-26: Program Understanding
    {
        id: 25,
        question: "What do you hope to achieve through this well-being program?",
        description: "Please share your specific goals and expectations",
        inputType: 'textarea',
        fieldName: 'programExpectations',
        category: 'program'
    },

    {
        id: 26,
        question: "How much time can you realistically commit to your well-being journey each week?",
        description: "Be honest about your available time",
        inputType: 'radio',
        fieldName: 'commitmentLevel',
        category: 'program',
        options: [
            { value: '15-30-minutes', label: '15-30 minutes per day', icon: FaChartLine },
            { value: '30-60-minutes', label: '30-60 minutes per day', icon: FaChartLine },
            { value: '1-2-hours', label: '1-2 hours per day', icon: FaChartLine },
            { value: 'flexible', label: 'Flexible - varies by day', icon: FaMeh },
            { value: 'minimal', label: 'Minimal time available', icon: FaBatteryEmpty }
        ]
    }
];

export const getQuestionById = (id: number): QuizQuestion | undefined => {
    return quizQuestions.find(q => q.id === id);
};

export const getQuestionsByCategory = (category: string): QuizQuestion[] => {
    return quizQuestions.filter(q => q.category === category);
};
