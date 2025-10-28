const FALLBACK_DESCRIPTIONS = [
    "The details are lost to the shadows.",
    "The air grows heavy, thick with untold stories and forgotten echoes.",
    "A strange silence falls over the room, the details blurring into indistinct shapes.",
    "Your senses are dulled, as if a magical veil obscures the true nature of this place.",
    "Flickering torchlight casts dancing shadows that hide as much as they reveal.",
    "An ancient, indecipherable script covers the walls, its meaning lost to time.",
    "The path forward is clear, but the history of this chamber remains shrouded in mystery.",
    "A cold draft whispers secrets you can't quite understand.",
    "Dust motes dance in a single beam of light, illuminating nothing of consequence.",
    "You find yourself in a place of great significance, but the details are lost to the shadows."
];

const getRandomFallback = (): string => {
    return FALLBACK_DESCRIPTIONS[Math.floor(Math.random() * FALLBACK_DESCRIPTIONS.length)];
};

/**
 * The API call has been removed. The function now always returns a random fallback description.
 * It is kept async to avoid changing the call sites in the game engine.
 */
export const getDynamicDescription = async (prompt: string): Promise<string> => {
    // This is a placeholder for the original Gemini API call.
    // It immediately resolves with a random description.
    return Promise.resolve(getRandomFallback());
};