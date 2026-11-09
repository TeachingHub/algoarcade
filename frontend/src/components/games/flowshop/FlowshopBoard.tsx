import type { DragEvent } from 'react';
import type { Job } from '@/types/games/flowshop';

import FlowshopGantt from './FlowshopGantt';
import FlowshopJob from './FlowshopJob';
import styles from '@/styles/components/games/flowshop/FlowshopBoard.module.css';

interface FlowshopBoardProps {
    width: number;
    height: number;
    jobs: Job[];
    currentOrder: number[];
    selectedMode: 'algorithm' | 'random' | 'manual' | 'builder';
    onJobDragStart: (jobId: number) => void;
    onJobDragOver: (event: DragEvent<HTMLDivElement>) => void;
    onJobDrop: (jobId: number) => void;
    onJobDragEnd: () => void;
    deleteJob: (id: number) => void;
}

const orderJobs = (jobs: Job[], currentOrder: number[]) => {
    const jobsById = new Map(jobs.map((job) => [job.id, job]));
    const orderedJobs = currentOrder
        .map((jobId) => jobsById.get(jobId))
        .filter((job): job is Job => job !== undefined);

    const orderedIds = new Set(orderedJobs.map((job) => job.id));
    return [
        ...orderedJobs,
        ...jobs.filter((job) => !orderedIds.has(job.id)),
    ];
};

export default function FlowshopBoard({
    width,
    height,
    jobs,
    currentOrder,
    selectedMode,
    onJobDragStart,
    onJobDragOver,
    onJobDrop,
    onJobDragEnd,
    deleteJob
}: FlowshopBoardProps) {
    const orderedJobs = orderJobs(jobs, currentOrder);

    const handleDragStart = (
        event: DragEvent<HTMLDivElement>,
        jobId: number,
    ) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(jobId));
        onJobDragStart(jobId);
    };

    const handleDrop = (
        event: DragEvent<HTMLDivElement>,
        jobId: number,
    ) => {
        event.preventDefault();
        onJobDrop(jobId);
    };

    return (
        <div className={styles.board} style={{ width, height }}>
            <section className={styles.jobsPanel}>
                <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>Job order</h3>
                    <span className={styles.itemCount}>{orderedJobs.length}</span>
                </div>

                <div className={styles.jobs}>
                    {orderedJobs.length > 0 ? (
                        orderedJobs.map((job, index) => (
                            <FlowshopJob
                                key={job.id}
                                job={job}
                                position={index + 1}
                                selectedMode={selectedMode}
                                onDragStart={handleDragStart}
                                onDragOver={onJobDragOver}
                                onDrop={handleDrop}
                                onDragEnd={onJobDragEnd}
                                deleteJob={() => deleteJob(job.id)}
                            />
                        ))
                    ) : (
                        <p className={styles.emptyState}>No jobs available</p>
                    )}
                </div>
            </section>

            <section className={`${styles.ganttPanel} ${styles.listPanelSelected}`}>
                <FlowshopGantt jobs={orderedJobs} />
            </section>
        </div>
    );
}