const MIN_JOB_COUNT = 4;
const MAX_JOB_COUNT = 8;

const MIN_OPERATION_DURATION = 1;
const MAX_OPERATION_DURATION = 20;

const EXAMPLE_JOBS = [
    { name: "Compact Car", icon: "🚗" },
    { name: "SUV", icon: "🚙" },
    { name: "Sports Car", icon: "🏎️" },
    { name: "Van", icon: "🚐" },
    { name: "Sedan", icon: "🚕" },
    { name: "Truck", icon: "🚚" },
    { name: "Bus", icon: "🚌" },
    { name: "Motorcycle", icon: "🏍️" },
    { name: "Pickup Truck", icon: "🛻" },
    { name: "Tractor", icon: "🚜" },
    { name: "Fire Truck", icon: "🚒" },
    { name: "Ambulance", icon: "🚑" },
    { name: "Police Car", icon: "🚓" },
    { name: "Taxi", icon: "🚖" },
    { name: "Delivery Truck", icon: "🚛" },
];

const EXAMPLE_MACHINES = [
    { name: "Chassis Assembly", icon: "🔩" },
    { name: "Welding", icon: "⚙️" },
    { name: "Painting", icon: "🖌️" },
    { name: "Mechanical Assembly", icon: "🔧" },
    { name: "Interior Assembly", icon: "💺" },
    { name: "Quality Control", icon: "🔍" },
];

const DEFAULT_JOBS = Object.values(EXAMPLE_JOBS).flat();

const DEFAULT_MACHINES = Object.values(EXAMPLE_MACHINES).flat();

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomJob() {
    return DEFAULT_JOBS[randomInteger(0, DEFAULT_JOBS.length - 1)];
}

function generateRandomJobs(count) {
    const jobs = [];

    for (let i = 0; i < count; i++) {
        const operations = [];

        for (let j = 0; j < DEFAULT_MACHINES.length; j++) {
            const duration = randomInteger(MIN_OPERATION_DURATION, MAX_OPERATION_DURATION);
            operations[j] = duration;
        }
        const randomDefaultJob = randomJob();

        jobs.push({
            id: i,
            name: randomDefaultJob.name,
            operationsTimes: operations,
            icon: randomDefaultJob.icon
        });
    }
    return jobs;
}

function encodeFlowshopInstance(author, jobs) {
    const jobsArray = jobs.map((job) => [
        job.id,
        job.name,
        job.operationsTimes,
        job.icon ?? null
    ]);

    return JSON.stringify([
        author,
        jobsArray
    ]);
}

function generate({ author = "system"} = {}) {
    const jobCount = randomInteger(MIN_JOB_COUNT, MAX_JOB_COUNT);

    const jobs = generateRandomJobs(jobCount);
    
    const data = encodeFlowshopInstance(author, jobs);

    return { data };
}

module.exports = {
    game: "flowshop",
    collection: "flowshop_daily_challenges",
    generate
};