import type { Point } from "@/types/games/tsp";

export const generateRandomPoints = (count: number, width: number, height: number): Point[] => {
    const points: Point[] = [];
    const padding = 50;

    for (let i = 0; i < count; i++) {
        points.push({
            id: i,
            x: padding + Math.random() * (width - 2 * padding),
            y: padding + Math.random() * (height - 2 * padding)
        });
    }

    return points;
};

export const getPredefinedPoints = (pattern: string, width: number, height: number): Point[] => {
    const points: Point[] = [];
    const padding = 80; // prevent points from touching edges
    const availableWidth = width - 2 * padding;
    const availableHeight = height - 2 * padding;
    const centerX = width / 2;
    const centerY = height / 2;

    if (pattern === 'supermarket') {
        const aisleWidth = availableWidth / 5;
        for (let i = 0; i < 15; i++) {
            let x;
            const col = i % 4;
            if (col === 0) x = padding + aisleWidth * 0.5;
            else if (col === 1) x = padding + aisleWidth * 1.5 + (Math.random() * 20 - 10);
            else if (col === 2) x = padding + aisleWidth * 2.5 + (Math.random() * 20 - 10);
            else x = padding + aisleWidth * 3.5;

            const y = padding + Math.random() * availableHeight;
            points.push({ id: i, x, y });
        }
    } else if (pattern === 'star') {
        const outerRadius = Math.min(availableWidth, availableHeight) / 2.5;
        const innerRadius = outerRadius / 2.5;
        const spikes = 5;

        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (spikes * 2)) * 2 * Math.PI - Math.PI / 2;
            points.push({
                id: i,
                x: centerX + r * Math.cos(angle),
                y: centerY + r * Math.sin(angle)
            });
        }
        for (let i = 0; i < 5; i++) {
            points.push({
                id: 10 + i,
                x: padding + Math.random() * availableWidth,
                y: padding + Math.random() * availableHeight
            });
        }
    } else if (pattern === 'grid') {
        const stepX = availableWidth / 3;
        const stepY = availableHeight / 3;
        let id = 0;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (Math.random() > 0.2 || id === 0 || id === 15) {
                    points.push({
                        id: id++,
                        x: padding + col * stepX + (Math.random() * 20 - 10),
                        y: padding + row * stepY + (Math.random() * 20 - 10)
                    });
                }
            }
        }
    } else if (pattern === 'islands') {
        const centers = [
            { x: width * 0.25, y: height * 0.3 },
            { x: width * 0.75, y: height * 0.3 },
            { x: width * 0.5, y: height * 0.8 }
        ];
        let id = 0;
        centers.forEach(center => {
            for (let i = 0; i < 4; i++) {
                points.push({
                    id: id++,
                    x: center.x + (Math.random() * 60 - 30),
                    y: center.y + (Math.random() * 60 - 30)
                });
            }
        });
    } else if (pattern === 'europe') {
        const cities = [
            { name: "Madrid", x: 0.15, y: 0.75 },
            { name: "London", x: 0.28, y: 0.35 },
            { name: "Paris", x: 0.32, y: 0.48 },
            { name: "Berlin", x: 0.52, y: 0.38 },
            { name: "Rome", x: 0.55, y: 0.72 },
            { name: "Vienna", x: 0.60, y: 0.52 },
            { name: "Warsaw", x: 0.70, y: 0.35 },
            { name: "Moscow", x: 0.90, y: 0.25 },
            { name: "Istanbul", x: 0.85, y: 0.80 },
            { name: "Athens", x: 0.75, y: 0.85 },
            { name: "Stockholm", x: 0.58, y: 0.15 },
            { name: "Oslo", x: 0.45, y: 0.15 },
            { name: "Lisbon", x: 0.05, y: 0.78 },
            { name: "Dublin", x: 0.18, y: 0.32 },
            { name: "Amsterdam", x: 0.38, y: 0.40 }
        ];

        const citiesPadding = 40;
        const citiesAvailWidth = width - 2 * citiesPadding;
        const citiesAvailHeight = height - 2 * citiesPadding;

        cities.forEach((city, index) => {
            points.push({
                id: index,
                x: citiesPadding + city.x * citiesAvailWidth,
                y: citiesPadding + city.y * citiesAvailHeight
            });
        });
    } else if (pattern === 'constellation') {
        const scale = Math.min(availableWidth, availableHeight) / 100;
        const stars = [
            { x: 10, y: 10 }, { x: 30, y: 15 }, { x: 45, y: 25 },
            { x: 60, y: 40 }, { x: 80, y: 35 }, { x: 85, y: 60 }, { x: 65, y: 65 }
        ];
        stars.forEach((s, i) => {
            points.push({
                id: i,
                x: padding + s.x * scale * 0.8,
                y: padding + s.y * scale * 0.8
            });
        });
        for (let i = 0; i < 5; i++) {
            points.push({
                id: 7 + i,
                x: padding + Math.random() * availableWidth,
                y: padding + Math.random() * availableHeight
            });
        }
    } else if (pattern === 'corners') {
        for (let i = 0; i < 11; i++) {
            points.push({
                id: i,
                x: centerX + (Math.random() * 100 - 50),
                y: centerY + (Math.random() * 100 - 50)
            });
        }
        points.push({ id: 11, x: padding, y: padding });
        points.push({ id: 12, x: width - padding, y: padding });
        points.push({ id: 13, x: width - padding, y: height - padding });
        points.push({ id: 14, x: padding, y: height - padding });
    } else {
        return getPredefinedPoints('supermarket', width, height);
    }

    return points;
};
