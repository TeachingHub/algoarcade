import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import styles from '@/styles/pages/games/TSP.module.css';
import Button from '@/components/shared/Button';
import GameTimer from '@/components/games/shared/GameTimer';


function formatTimeDuration(ms?: number | null){
    if (!ms && ms !== 0) return '';
    const s = Math.floor((ms ?? 0) / 1000);
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`
}

export interface DailyChallengeLeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL?: string | null;
    score: number;
    time_ms?: number | null;
}

interface DailyChallengeControlsProps {
    dateLabel: string;
    isToday: boolean;
    canGoNext: boolean;

    hasSubmitted: boolean;
    canSubmit: boolean;
    canClear: boolean;
    isAuthenticated: boolean;

    onPreviousDay: () => void;
    onNextDay: () => void;
    onSubmit: () => void;
    onClear: () => void;

    leaderboard?: DailyChallengeLeaderboardEntry[];
    currentUserId?: string;
    isLoading?: boolean;

    formatScore?: (score: number) => ReactNode;

    leaderboardTitle?: string;
    emptyLeaderboardMessage?: string;
    todayEmptyLeaderboardMessage?: string;
}

export default function DailyChallengeControls({
    dateLabel,
    isToday,
    canGoNext,
    hasSubmitted,
    canSubmit,
    canClear,
    isAuthenticated,
    onPreviousDay,
    onNextDay,
    onSubmit,
    onClear,
    leaderboard,
    currentUserId,
    isLoading = false,
    formatScore = (score) => score,
    leaderboardTitle = 'LEADERBOARD',
    emptyLeaderboardMessage = 'No scores for this day.',
    todayEmptyLeaderboardMessage = 'Be the first to submit a score today!'
}: DailyChallengeControlsProps) {
    const hasLeaderboard = leaderboard !== undefined;

    return (
        <div className={styles.competitiveControls}>
            <GameTimer />

            <div className={styles.dateNav}>
                <button
                    className={styles.dateNavButton}
                    onClick={onPreviousDay}
                    aria-label="Previous day"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className={styles.dateNavCenter}>
                    <span className={styles.dateNavLabel}>{dateLabel}</span>
                    <span
                        className={`${styles.dateNavBadge} ${
                            isToday
                                ? styles.dateNavBadgeLive
                                : styles.dateNavBadgePractice
                        }`}
                    >
                        {isToday ? '● LIVE' : 'PRACTICE'}
                    </span>
                </div>

                <button
                    className={styles.dateNavButton}
                    onClick={onNextDay}
                    disabled={!canGoNext}
                    aria-label="Next day"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <h3 className={styles.sectionTitle}>
                {isToday ? 'DAILY CHALLENGE' : 'PRACTICE MODE'}
            </h3>

            {isAuthenticated ? (
                <div className={styles.buttonGroup}>
                    <Button
                        style={['primary', 'fullWidth']}
                        label={
                            hasSubmitted
                                ? 'ALREADY SUBMITTED'
                                : isToday
                                    ? 'SUBMIT SCORE'
                                    : 'SUBMIT (PRACTICE)'
                        }
                        onClick={onSubmit}
                        disabled={hasSubmitted || !canSubmit}
                    />

                    <Button
                        style={['secondary', 'fullWidth']}
                        label="CLEAR PATH"
                        onClick={onClear}
                        disabled={hasSubmitted || !canClear}
                    />
                </div>
            ) : (
                <div className={styles.buttonGroup}>
                    <p className={styles.loginPrompt}>
                        Log in to submit your score and compete on the leaderboard!
                    </p>

                    <Button
                        style={['primary', 'fullWidth']}
                        label="LOG IN"
                        to="/login"
                    />

                    <Button
                        style={['secondary', 'fullWidth']}
                        label="REGISTER"
                        to="/register"
                    />
                </div>
            )}

            {hasLeaderboard && (
                <>
                    <h3 className={styles.leaderboardTitle}>
                        {leaderboardTitle}
                    </h3>

                    {isLoading && leaderboard.length === 0 ? (
                        <p className={styles.loadingText}>Loading...</p>
                    ) : leaderboard.length > 0 ? (
                        <ul className={styles.leaderboardList}>
                            {leaderboard.map((entry, index) => (
                                <li
                                    key={entry.userId}
                                    className={`${styles.leaderboardItem} ${
                                        entry.userId === currentUserId
                                            ? styles.leaderboardItemActive
                                            : styles.leaderboardItemInactive
                                    }`}
                                >
                                    <span className={styles.leaderboardRank}>
                                        {index + 1}.
                                    </span>

                                    {entry.photoURL ? (
                                        <img
                                            src={entry.photoURL}
                                            alt={entry.displayName}
                                            className={styles.leaderboardAvatar}
                                        />
                                    ) : (
                                        <div
                                            className={
                                                styles.leaderboardAvatarPlaceholder
                                            }
                                        >
                                            {entry.displayName
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </div>
                                    )}

                                    <div className={styles.leaderboardInfo}>
                                        <div className={styles.leaderboardName}>
                                            {entry.displayName}
                                        </div>

                                        <div
                                            className={
                                                styles.leaderboardDistance
                                            }
                                        >
                                            {formatScore(entry.score)}

                                            {entry.time_ms != null &&
                                                formatTimeDuration && (
                                                    <span
                                                        className={
                                                            styles.leaderboardTime
                                                        }
                                                    >
                                                        {' · '}
                                                        {formatTimeDuration(
                                                            entry.time_ms
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.emptyLeaderboard}>
                            {isToday
                                ? todayEmptyLeaderboardMessage
                                : emptyLeaderboardMessage}
                        </p>
                    )}
                </>
            )}
        </div>
    );
}