import React, { useState } from 'react';

interface IntroStoryScreenProps {
    onFinished: () => void;
}

const storyParts = [
    "The Age of Magic is over. What remains are but echoes, dangerous remnants of power that twist reality itself.",
    "You are a Remnant Seeker, one of the daring few who hunt for these artifacts, drawn by the promise of immense power or a quick, forgotten death.",
    "Your journey leads you to the 'Terminal Dungeon,' a gaping anomaly carved into the mountainside where the echoes of magic are strongest.",
    "Beside its ominous entrance, a flickering lantern illuminates a makeshift stall—a rare sign of commerce in this desolate place.",
    "A hooded figure gestures from the stall. 'Another seeker, eh? Come. The echoes will devour you unprepared.'",
    "With little more than hope and the steel in your hand, you approach, knowing this place could be your tomb or the forge of your legend..."
];

const IntroStoryScreen: React.FC<IntroStoryScreenProps> = ({ onFinished }) => {
    const [currentPart, setCurrentPart] = useState(0);

    const handleNext = () => {
        if (currentPart < storyParts.length - 1) {
            setCurrentPart(currentPart + 1);
        } else {
            onFinished();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 animate-fadeIn min-h-[400px]">
            <div className="flex-grow flex items-center justify-center">
                <p className="text-lg text-gray-300 italic max-w-lg">
                    {storyParts[currentPart]}
                </p>
            </div>
            <div className="mt-8">
                <button
                    onClick={handleNext}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 border-b-4 border-green-800 hover:border-green-600 rounded transition duration-200"
                >
                    {currentPart < storyParts.length - 1 ? "[ Continue ]" : "[ Begin Your Journey ]"}
                </button>
            </div>
        </div>
    );
};

export default IntroStoryScreen;