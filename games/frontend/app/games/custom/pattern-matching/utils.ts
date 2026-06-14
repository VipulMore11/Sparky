/**
 * Utility functions for Pattern Matching Game
 * Handles pattern generation, validation, and evaluation metrics
 */

export interface PatternItem {
    id: string;
    type: 'letter' | 'number' | 'shape' | 'color';
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    fontSize?: number;
    fontFamily?: string;
    fontStyle?: string;
    textFill?: string;
    isSelected?: boolean;
}

export interface PatternOption {
    id: string;
    value: string;
    isCorrect: boolean;
}

export interface GameMetrics {
    score: number;
    accuracy: number;
    totalAttempts: number;
    correctAnswers: number;
    avgResponseTime: number;
    patternAnalysisTime: number;
    patternComplexityScore: number;
    visualProcessingScore: number;
    cognitiveLoadScore: number;
    difficulty: string;
    gameMode: string;
    completionTime: number;
}

/**
 * Calculate pattern complexity based on various factors
 */
export function calculatePatternComplexity(items: PatternItem[]): number {
    const itemCount = items.length;
    const uniqueTypes = new Set(items.map(item => item.type)).size;
    const uniqueValues = new Set(items.map(item => item.value)).size;
    const uniqueColors = new Set(items.map(item => item.fill)).size;

    // Complexity factors:
    // - Number of items (5 points each)
    // - Variety of types (15 points each)
    // - Variety of values (10 points each)
    // - Color variation (5 points each)
    const complexityScore = Math.min(100,
        (itemCount * 5) +
        (uniqueTypes * 15) +
        (uniqueValues * 10) +
        (uniqueColors * 5)
    );

    return Math.round(complexityScore);
}

/**
 * Calculate visual processing score
 * Higher score = faster visual pattern recognition
 */
export function calculateVisualProcessingScore(
    avgResponseTime: number,
    accuracy: number
): number {
    // Optimal response time is 2-5 seconds (2000-5000ms)
    // Faster than 2s might indicate guessing, slower than 10s indicates difficulty
    const optimalMin = 2000;
    const optimalMax = 5000;

    let timeScore = 0;
    if (avgResponseTime < optimalMin) {
        // Too fast - might be guessing
        timeScore = 50 + ((avgResponseTime / optimalMin) * 25);
    } else if (avgResponseTime <= optimalMax) {
        // Optimal range
        timeScore = 100;
    } else if (avgResponseTime <= 10000) {
        // Slower but acceptable
        timeScore = 100 - ((avgResponseTime - optimalMax) / (10000 - optimalMax) * 40);
    } else {
        // Very slow
        timeScore = Math.max(20, 60 - (avgResponseTime / 1000));
    }

    // Combine time score with accuracy (60% accuracy, 40% time)
    const finalScore = (accuracy * 0.6) + (timeScore * 0.4);

    return Math.round(Math.max(0, Math.min(100, finalScore)));
}

/**
 * Calculate cognitive load score
 * Higher score = higher cognitive demand
 */
export function calculateCognitiveLoad(
    patternItems: PatternItem[],
    difficulty: 'easy' | 'medium' | 'hard',
    accuracy: number,
    responseTime: number
): number {
    const difficultyMultiplier = {
        'easy': 1,
        'medium': 1.5,
        'hard': 2
    }[difficulty];

    // Factors that increase cognitive load:
    const itemComplexity = patternItems.length * difficultyMultiplier;
    const accuracyFactor = (100 - accuracy) * 0.3; // Lower accuracy = higher load
    const timeFactor = Math.min(30, responseTime / 300); // Longer time = higher load

    // Calculate load score (0-100)
    const loadScore = Math.min(100,
        (itemComplexity * 3) +
        accuracyFactor +
        timeFactor
    );

    return Math.round(loadScore);
}

/**
 * Calculate pattern recognition ability score
 */
export function calculatePatternRecognitionScore(metrics: {
    accuracy: number;
    avgResponseTime: number;
    patternComplexityScore: number;
}): number {
    // Weighted combination of factors
    const accuracyWeight = 0.5;
    const speedWeight = 0.3;
    const complexityWeight = 0.2;

    // Normalize response time (faster is better, optimal around 3-5 seconds)
    const timeScore = Math.max(0, 100 - (metrics.avgResponseTime / 100));

    // Bonus for handling complex patterns
    const complexityBonus = (metrics.patternComplexityScore / 100) * 20;

    const score =
        (metrics.accuracy * accuracyWeight) +
        (timeScore * speedWeight) +
        (metrics.patternComplexityScore * complexityWeight) +
        complexityBonus;

    return Math.round(Math.min(100, score));
}

/**
 * Generate evaluation report for the pattern matching game
 */
export function generateEvaluationReport(metrics: GameMetrics): {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
} {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze accuracy
    if (metrics.accuracy >= 90) {
        strengths.push('Excellent pattern recognition accuracy');
    } else if (metrics.accuracy >= 70) {
        strengths.push('Good pattern recognition ability');
    } else if (metrics.accuracy < 50) {
        weaknesses.push('Low accuracy in pattern identification');
        recommendations.push('Practice identifying simple patterns before complex ones');
    }

    // Analyze response time
    if (metrics.avgResponseTime <= 3000) {
        strengths.push('Fast visual processing speed');
    } else if (metrics.avgResponseTime <= 5000) {
        strengths.push('Good response timing');
    } else if (metrics.avgResponseTime > 8000) {
        weaknesses.push('Slow pattern analysis time');
        recommendations.push('Work on quick pattern recognition exercises');
    }

    // Analyze visual processing
    if (metrics.visualProcessingScore >= 80) {
        strengths.push('Strong visual-spatial processing');
    } else if (metrics.visualProcessingScore < 50) {
        weaknesses.push('Visual processing needs improvement');
        recommendations.push('Practice visual discrimination exercises');
    }

    // Analyze cognitive load
    if (metrics.cognitiveLoadScore >= 70 && metrics.accuracy >= 75) {
        strengths.push('Handles complex patterns well under cognitive load');
    } else if (metrics.cognitiveLoadScore >= 70 && metrics.accuracy < 60) {
        weaknesses.push('Performance drops under high cognitive load');
        recommendations.push('Build cognitive stamina with progressive difficulty');
    }

    // Calculate overall score
    const overallScore = calculatePatternRecognitionScore({
        accuracy: metrics.accuracy,
        avgResponseTime: metrics.avgResponseTime,
        patternComplexityScore: metrics.patternComplexityScore
    });

    return {
        overallScore,
        strengths,
        weaknesses,
        recommendations
    };
}

/**
 * Validate pattern configuration
 */
export function validatePatternConfig(config: any): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!config.patternItems || config.patternItems.length === 0) {
        errors.push('Pattern must contain at least one item');
    }

    if (!config.options || config.options.length < 2) {
        errors.push('Must have at least 2 answer options');
    }

    if (config.options && !config.options.some((opt: any) => opt.isCorrect)) {
        errors.push('Must have at least one correct answer');
    }

    if (!config.gridSize || !config.gridSize.rows || !config.gridSize.cols) {
        errors.push('Grid size must be specified');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Format metrics for display
 */
export function formatMetricsForDisplay(metrics: GameMetrics): Record<string, string> {
    return {
        'Score': metrics.score.toString(),
        'Accuracy': `${metrics.accuracy}%`,
        'Attempts': metrics.totalAttempts.toString(),
        'Correct': metrics.correctAnswers.toString(),
        'Avg Response Time': `${metrics.avgResponseTime}ms`,
        'Pattern Analysis': `${metrics.patternAnalysisTime}ms`,
        'Complexity Score': metrics.patternComplexityScore.toString(),
        'Visual Processing': metrics.visualProcessingScore.toString(),
        'Cognitive Load': metrics.cognitiveLoadScore.toString(),
        'Difficulty': metrics.difficulty,
        'Game Mode': metrics.gameMode.replace('_', ' '),
        'Completion Time': `${metrics.completionTime}s`
    };
}

/**
 * Compare metrics with benchmarks
 */
export function compareToBenchmark(metrics: GameMetrics, difficulty: string): {
    metric: string;
    value: number;
    benchmark: number;
    performance: 'above' | 'at' | 'below';
}[] {
    const benchmarks = {
        easy: {
            accuracy: 85,
            avgResponseTime: 3000,
            visualProcessingScore: 70,
            cognitiveLoadScore: 40
        },
        medium: {
            accuracy: 75,
            avgResponseTime: 4500,
            visualProcessingScore: 60,
            cognitiveLoadScore: 55
        },
        hard: {
            accuracy: 65,
            avgResponseTime: 6000,
            visualProcessingScore: 50,
            cognitiveLoadScore: 70
        }
    };

    const benchmark = benchmarks[difficulty as keyof typeof benchmarks] || benchmarks.medium;

    return [
        {
            metric: 'Accuracy',
            value: metrics.accuracy,
            benchmark: benchmark.accuracy,
            performance: metrics.accuracy > benchmark.accuracy ? 'above' :
                metrics.accuracy === benchmark.accuracy ? 'at' : 'below'
        },
        {
            metric: 'Response Time',
            value: metrics.avgResponseTime,
            benchmark: benchmark.avgResponseTime,
            performance: metrics.avgResponseTime < benchmark.avgResponseTime ? 'above' :
                metrics.avgResponseTime === benchmark.avgResponseTime ? 'at' : 'below'
        },
        {
            metric: 'Visual Processing',
            value: metrics.visualProcessingScore,
            benchmark: benchmark.visualProcessingScore,
            performance: metrics.visualProcessingScore > benchmark.visualProcessingScore ? 'above' :
                metrics.visualProcessingScore === benchmark.visualProcessingScore ? 'at' : 'below'
        }
    ];
}
