import type { DragEvent } from 'react';
import type { Job } from '@/types/games/flowshop';

import styles from '@/styles/components/games/flowshop/FlowshopBoard.module.css';

interface FlowshopJobProps {
    job: Job;
    position: number;
    selectedMode: 'algorithm' | 'random' | 'manual' | 'builder';
    onDragStart: (event: DragEvent<HTMLDivElement>, jobId: number) => void;
    onDragOver: (event: DragEvent<HTMLDivElement>) => void;
    onDrop: (event: DragEvent<HTMLDivElement>, jobId: number) => void;
    onDragEnd: () => void;
    deleteJob: () => void;
}

export default function FlowshopJob({
    job,
    position,
    selectedMode,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    deleteJob
}: FlowshopJobProps) {
    const canDrag = selectedMode === 'manual';

    return (
        <div
            className={`${styles.job} ${canDrag ? styles.jobDraggable : ''}`}
            draggable={canDrag}
            onDragStart={(event) => onDragStart(event, job.id)}
            onDragOver={onDragOver}
            onDrop={(event) => onDrop(event, job.id)}
            onDragEnd={onDragEnd}
        >
            <span className={styles.jobPosition}>{position}</span>

            {job.icon && (
                <span className={styles.jobIcon} aria-hidden="true">
                    {job.icon}
                </span>
            )}

            <span className={styles.jobContent}>
                <span className={styles.jobName}>{job.name}</span>
                <span className={styles.jobOperations}>
                    {job.operationsTimes.map((time, index) => (
                        <span key={`${job.id}-${index}`}>
                            M{index + 1}: {time}
                        </span>
                    ))}
                </span>
            </span>

            {canDrag && (
                <span className={styles.dragHandle} aria-hidden="true">
                    ⋮⋮
                </span>
            )}

            {selectedMode === 'builder' && (
                <button
            type="button"
            className={styles.jobDelete}
            onClick={deleteJob}
            aria-label={`Delete ${job.name}`}
            >
                🗑️
            </button>
            )}
        </div>
    );
}