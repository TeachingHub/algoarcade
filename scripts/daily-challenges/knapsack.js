const MIN_ITEM_COUNT = 4;
const MAX_ITEM_COUNT = 10;

const MIN_ITEM_WEIGHT = 20;
const MAX_ITEM_WEIGHT = 150;

const ITEM_CATEGORIES = {
    Weapons: [
        { name: "Axe", icon: "🪓" },
        { name: "Sword", icon: "⚔️" },
        { name: "Shield", icon: "🛡️" },
        { name: "Bow", icon: "🏹" },
    ],

    Treasures: [
        { name: "Diamond", icon: "💎" },
        { name: "Crown", icon: "👑" },
        { name: "Gold Coin", icon: "🪙" },
        { name: "Coin Bag", icon: "💰" },
        { name: "Ring", icon: "💍" },
        { name: "Golden Key", icon: "🗝️" },
    ],

    Food: [
        { name: "Apple", icon: "🍎" },
        { name: "Bread", icon: "🍞" },
        { name: "Cheese", icon: "🧀" },
        { name: "Banana", icon: "🍌" },
        { name: "Chocolate", icon: "🍫" },
        { name: "Sandwich", icon: "🥪" },
    ],

    Tools: [
        { name: "Hammer", icon: "🔨" },
        { name: "Scissors", icon: "✂️" },
        { name: "Umbrella", icon: "☂️" },
        { name: "Camera", icon: "📷" },
        { name: "Phone", icon: "📱" },
        { name: "Flashlight", icon: "🔦" },
    ],
};

const DEFAULT_ITEMS = Object.values(ITEM_CATEGORIES).flat();

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem() {
    return DEFAULT_ITEMS[randomInteger(0, DEFAULT_ITEMS.length - 1)];
}

function generateRandomItems(count) {
    const items = [];

    const factor = Number((Math.random() * 4 + 1).toFixed(2));

    let accumulatedWeight = 0;

    for (let i = 0; i < count; i++) {
            const weight = randomInteger(MIN_ITEM_WEIGHT, MAX_ITEM_WEIGHT);
            accumulatedWeight += weight;
            const baseValue = weight * factor;
            const variation = 0.7 + Math.random() * 0.6; //Random variation +- 30%
            const value = Math.round((baseValue * variation));

            const randomDefaultItem = randomItem();

            items.push({
                id: i,
                name: randomDefaultItem.name,
                weight,
                value,
                icon: randomDefaultItem.icon
            });
        }

        const maxWeightPercentage = 0.30 + Math.random() * 0.55;
        const maxWeight = Math.round(accumulatedWeight * maxWeightPercentage);

        return {items, maxWeight};
}

function encodeKnapsackInstance(author, items, maxWeight, knapsackType) {
    const itemsArray = items.map((item) => [
        item.id,
        item.name,
        item.value,
        item.weight,
        item.icon ?? null
    ]);

    return JSON.stringify([
        author,
        itemsArray,
        maxWeight,
        knapsackType
    ]);
}

function generate({ author = "system"} = {}) {
    const itemCount = randomInteger(MIN_ITEM_COUNT, MAX_ITEM_COUNT);

    const {
        items,
        maxWeight
    } = generateRandomItems(itemCount);

    const knapsackType = Math.random() < 0.5 ? "fractional" : "binary";
    
    const data = encodeKnapsackInstance(author, items, maxWeight, knapsackType)

    return { data };
}

module.exports = {
    game: "knapsack",
    collection: "knapsack_daily_challenges",
    generate
};