/**
 * Simple K-Means implementation
 * Points: Array of arrays (e.g., [[0.9, 0.8], [0.1, 0.2]])
 * 
 * Returns: Array of cluster indices matching the input points order
 */
export function kMeans(points: number[][], k: number, maxIterations: number = 100): number[] {
    if (points.length === 0) return [];
    if (points.length < k) return new Array(points.length).fill(0); // Not enough points for k clusters

    const dimensions = points[0].length;
    
    // 1. Initialize centroids randomly
    let centroids = points.slice(0, k).map(p => [...p]); // Improved init could be K-Means++
    
    // Assign random points as initial centroids if we have enough points
    if (points.length > k) {
        const shuffled = [...points].sort(() => 0.5 - Math.random());
        centroids = shuffled.slice(0, k).map(p => [...p]);
    }

    let assignments = new Array(points.length).fill(-1);
    let changed = true;
    let iter = 0;

    while (changed && iter < maxIterations) {
        changed = false;
        
        // 2. Assign points to nearest centroid
        for (let i = 0; i < points.length; i++) {
            let minDist = Infinity;
            let closestCentroid = -1;
            
            for (let j = 0; j < k; j++) {
                const dist = euclideanDistance(points[i], centroids[j]);
                if (dist < minDist) {
                    minDist = dist;
                    closestCentroid = j;
                }
            }
            
            if (assignments[i] !== closestCentroid) {
                assignments[i] = closestCentroid;
                changed = true;
            }
        }

        // 3. Update centroids
        const sums = new Array(k).fill(0).map(() => new Array(dimensions).fill(0));
        const counts = new Array(k).fill(0);

        for (let i = 0; i < points.length; i++) {
            const clusterIdx = assignments[i];
            counts[clusterIdx]++;
            for (let d = 0; d < dimensions; d++) {
                sums[clusterIdx][d] += points[i][d];
            }
        }

        for (let j = 0; j < k; j++) {
            if (counts[j] > 0) {
                for (let d = 0; d < dimensions; d++) {
                    centroids[j][d] = sums[j][d] / counts[j];
                }
            } else {
                // If a cluster is empty, re-initialize it to a random point (simple recovery)
                const randIdx = Math.floor(Math.random() * points.length);
                centroids[j] = [...points[randIdx]];
            }
        }
        
        iter++;
    }

    return assignments;
}

function euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}
