import type { Job } from '@/types/games/flowshop';

import styles from '@/styles/components/games/flowshop/FlowshopBoard.module.css';

import { exampleMachines } from '@/utils/flowshop';

interface FlowshopGanttProps {
    jobs: Job[];
}

interface Operation {
    job: Job;
    machine: number;
    start: number;
    end: number;
}

const colors = [
  "#4A90D9",
  "#55A879",
  "#D96B6B",
  "#E99A45",
  "#D6B647",
  "#9273C4",
  "#45AFAF",
  "#718096"
];

const buildSchedule = (jobs: Job[]) => {
    const machineEndTimes: number[] = [];
    const operations: Operation[] = [];

    jobs.forEach((job) => {
        let jobEndTime = 0;

        job.operationsTimes.forEach((duration, machine) => {
            const start = Math.max(jobEndTime, machineEndTimes[machine] ?? 0);
            const end = start + duration;

            operations.push({ job, machine, start, end });
            machineEndTimes[machine] = end;
            jobEndTime = end;
        });
    });

    return {
        operations,
        machineCount: machineEndTimes.length,
        makespan: Math.max(0, ...machineEndTimes),
    };
};

export default function FlowshopGantt({ jobs }: FlowshopGanttProps) {
    const { operations, machineCount, makespan } = buildSchedule(jobs);
    const timelineSize = Math.max(makespan, 1);

    if (jobs.length === 0 || machineCount === 0) {
        return (
            <p className={styles.emptyState}>
                Add jobs with processing times to see the schedule
            </p>
        );
    }

    return (
        <div className={styles.gantt}>
            <div className={styles.ganttHeader}>
                <h3 className={styles.panelTitle}>Gantt chart</h3>
                <span className={styles.makespan}>MAKESPAN: {makespan}</span>
            </div>

            <div className={styles.timeAxis}>
                <span>0</span>
                <span>{Math.round(makespan / 2)}</span>
                <span>{makespan}</span>
            </div>

            <div className={styles.machineRows}>
                {Array.from({ length: machineCount }, (_, machine) => (
                    <div className={styles.machineRow} key={machine}>
                        <span title={exampleMachines[machine].name} className={styles.machineLabel}>{exampleMachines[machine].icon}</span>

                        <div className={styles.timeline}>
                            {operations
                                .filter((operation) => operation.machine === machine)
                                .map((operation) => (
                                    <div
                                        className={styles.operation}
                                        key={`${operation.job.id}-${machine}`}
                                        style={{
                                            left: `${(operation.start / timelineSize) * 100}%`,
                                            width: `${((operation.end - operation.start) / timelineSize) * 100}%`,
                                            backgroundColor: colors[operation.job.id % colors.length],
                                        }}
                                        title={`${operation.job.name}: ${operation.start} - ${operation.end}`}
                                    >
                                        <span>{operation.job.name}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}