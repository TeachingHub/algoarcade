/**
 * Blog seed data — 2 posts about key algorithms in the app.
 * 
 * HOW TO USE:
 * Import and call seedBlogPosts() from anywhere (e.g. a button in admin, or browser console).
 * It will create the posts in Firestore only if they don't already exist (checks by slug).
 */

import { getPostBySlug, createPost } from "@/services/blogService";

const TSP_POST_CONTENT = `## What Is the Traveling Salesperson Problem?

The **Traveling Salesperson Problem (TSP)** is one of the most famous problems in computer science and combinatorial optimization. The question is deceptively simple:

> Given a list of cities and the distances between each pair, what is the shortest possible route that visits every city exactly once and returns to the starting city?

Despite its simplicity, TSP is classified as **NP-hard**, meaning there is no known algorithm that can solve it efficiently for all cases. As the number of cities grows, the number of possible routes explodes factorially.

## Why Is It So Hard?

For **n** cities, the number of possible tours is **(n-1)!/2**. Let's see how fast this grows:

- 5 cities → 12 routes
- 10 cities → 181,440 routes
- 15 cities → ~43 billion routes
- 20 cities → ~60 quadrillion routes

Even the fastest computers cannot brute-force all possibilities for more than ~25 cities in a reasonable time.

## Common Approaches

### 1. Brute Force
Try every possible permutation and keep the shortest. This guarantees the optimal solution but has a time complexity of **O(n!)**, making it impractical for large inputs.

### 2. Nearest Neighbor (Greedy)
Start at a random city, always move to the nearest unvisited city, and return to the start. This is **fast** (O(n²)) but often gives a suboptimal solution — sometimes 20-25% longer than the best route.

\`\`\`
Algorithm: Nearest Neighbor
1. Start at city 0
2. Mark city 0 as visited
3. While there are unvisited cities:
   a. Find the nearest unvisited city
   b. Move to it and mark as visited
4. Return to city 0
\`\`\`

### 3. 2-Opt Improvement
Take an existing route and try to improve it by **reversing segments**. If reversing a segment between two edges produces a shorter route, keep the change. Repeat until no more improvements can be made.

This is a **local search** heuristic — it won't guarantee the global optimum, but it significantly improves greedy solutions.

### 4. Dynamic Programming (Held-Karp)
Uses bitmask DP to solve TSP in **O(n² · 2ⁿ)** time. Much better than brute force, but still exponential. Practical for up to ~20 cities.

## TSP in the Real World

TSP has applications everywhere:

- **Logistics**: Optimizing delivery routes for packages
- **Manufacturing**: Minimizing the movement of a drill head on a circuit board
- **DNA Sequencing**: Finding the optimal order to sequence gene fragments
- **Astronomy**: Planning telescope observation schedules

## Try It Yourself!

In AlgoArcade's TSP game, you can:

- **Visualize** how different algorithms approach the problem
- **Play** against the algorithm — can you find a shorter route?
- **Compete** in daily challenges and climb the leaderboard

The best way to understand why TSP is so hard is to try solving it by hand. You'll quickly appreciate why computer scientists have spent decades working on this problem!`;

const PATHFINDING_POST_CONTENT = `## What Is Pathfinding?

**Pathfinding** is the problem of finding the best route between two points. Whether it's a GPS calculating your driving directions or a video game character navigating around obstacles, pathfinding algorithms are everywhere.

The most popular pathfinding algorithm is **A*** (A-star), and it's what we use in AlgoArcade.

## How Does A* Work?

A* combines the best of two worlds:

- **Dijkstra's Algorithm**: Explores all paths systematically, guarantees the shortest path, but can be slow
- **Greedy Best-First Search**: Uses a heuristic to rush toward the goal, fast but doesn't guarantee the shortest path

A* uses both a **cost function** and a **heuristic function** to make smart decisions:

\`\`\`
f(n) = g(n) + h(n)

where:
  f(n) = total estimated cost
  g(n) = actual cost from start to current node
  h(n) = estimated cost from current node to goal (heuristic)
\`\`\`

### The Algorithm Step by Step

\`\`\`
1. Add the start node to the OPEN list
2. While the OPEN list is not empty:
   a. Pick the node with the lowest f(n)
   b. If it's the goal → reconstruct and return the path
   c. Move it to the CLOSED list
   d. For each neighbor:
      - If in CLOSED list → skip
      - Calculate tentative g(n)
      - If not in OPEN or tentative g is better:
        - Update g(n) and f(n)
        - Set parent to current node
        - Add to OPEN list
3. If OPEN list is empty → no path exists
\`\`\`

## The Heuristic: What Makes A* Smart

The heuristic **h(n)** is the secret sauce. Common choices include:

### Manhattan Distance
Best for grids where you can only move in 4 directions (up, down, left, right):

\`\`\`
h(n) = |x_current - x_goal| + |y_current - y_goal|
\`\`\`

### Euclidean Distance
Best for grids where diagonal movement is allowed:

\`\`\`
h(n) = sqrt((x_current - x_goal)² + (y_current - y_goal)²)
\`\`\`

### Why the Heuristic Matters

- If **h(n) = 0**, A* becomes Dijkstra's algorithm (slow but optimal)
- If **h(n)** overestimates the real cost, A* may not find the optimal path
- If **h(n)** is **admissible** (never overestimates), A* is guaranteed to find the shortest path

## Time Complexity

The time complexity of A* depends on the heuristic quality:

- **Worst case**: O(b^d) where b is the branching factor and d is the depth
- **Best case**: With a perfect heuristic, A* goes straight to the goal in O(d)
- **Typical case**: Much faster than Dijkstra's due to the heuristic pruning

## A* vs Other Algorithms

| Algorithm | Optimal? | Uses Heuristic? | Speed |
|-----------|----------|-----------------|-------|
| BFS | Yes (unweighted) | No | Slow |
| Dijkstra | Yes | No | Medium |
| Greedy Best-First | No | Yes | Fast |
| **A*** | **Yes** | **Yes** | **Fast** |

## Applications in the Real World

- **Video Games**: NPC navigation, enemy AI pathfinding
- **Robotics**: Autonomous navigation in physical spaces
- **GPS Systems**: Finding the fastest driving route
- **Network Routing**: Data packet routing in computer networks

## Try It Yourself!

In AlgoArcade's Pathfinding game, you can:

- **Draw walls** to create mazes and obstacles
- **Watch A*** solve the maze in real-time, seeing which cells it explores
- **Draw your own path** and compare it against A*'s optimal solution
- **Move the start and goal** points to see how the algorithm adapts

Building walls and watching A* navigate around them is the best way to develop intuition for how heuristic search works!`;

interface SeedPost {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    tags: string[];
    coverImage: string;
    published: boolean;
}

const SEED_POSTS: SeedPost[] = [
    {
        title: "THE TRAVELING SALESPERSON PROBLEM",
        slug: "traveling-salesperson-problem",
        excerpt: "Why finding the shortest route through N cities is one of the hardest problems in computer science — and how algorithms approach it.",
        content: TSP_POST_CONTENT,
        author: "AlgoArcade",
        tags: ["TSP", "Optimization", "NP-Hard"],
        coverImage: "/banners/tsp-banner.jpg",
        published: true,
    },
    {
        title: "PATHFINDING WITH A* ALGORITHM",
        slug: "pathfinding-a-star",
        excerpt: "How A* combines the best of Dijkstra and greedy search to find the shortest path — and why the heuristic is the secret sauce.",
        content: PATHFINDING_POST_CONTENT,
        author: "AlgoArcade",
        tags: ["Pathfinding", "A*", "Search"],
        coverImage: "/banners/pathfinder-banner.png",
        published: true,
    },
];

export async function seedBlogPosts(): Promise<{ created: number; skipped: number }> {
    let created = 0;
    let skipped = 0;

    for (const post of SEED_POSTS) {
        const existing = await getPostBySlug(post.slug);
        if (existing) {
            console.log(`Post "${post.slug}" already exists, skipping.`);
            skipped++;
            continue;
        }

        await createPost(post);
        console.log(`Created post: "${post.title}"`);
        created++;
    }

    console.log(`Seed complete: ${created} created, ${skipped} skipped.`);
    return { created, skipped };
}
