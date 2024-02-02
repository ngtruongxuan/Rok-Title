import type {Governor, GovernorKPI} from "@prisma/client";

const POWER_THRESHOLD = 65000000;

export const calculateKpi = (
    governorKPI: GovernorKPI & { governor: Governor },
) => {
    const kpi =
        Number(governorKPI.t4_kill_dif) * 10 +
        Number(governorKPI.t5_kill_dif) * 20 +
        Number(governorKPI.dead_dif) * 5;

    const kpiNeeded =
        Number(governorKPI.governor.power) >= POWER_THRESHOLD
            ? 0.3 * Number(governorKPI.governor.power)
            : 0.2 * Number(governorKPI.governor.power);
    const kpiRemaining = Math.abs(kpiNeeded - kpi);
    const deadRequirement =
        Number(governorKPI.governor.power) >= POWER_THRESHOLD
            ? 0.3 * kpiNeeded
            : 0.2 * kpiNeeded;

    return {
        governorID: governorKPI.governor.governor_id,
        governorName: governorKPI.governor.governor_name,
        power: governorKPI.governor.power,
        powerDif: Number(governorKPI.power_dif).toLocaleString("en-US"),
        t1KillDif: Number(governorKPI.t1_kill_dif).toLocaleString("en-US"),
        t2KillDif: Number(governorKPI.t2_kill_dif).toLocaleString("en-US"),
        t3KillDif: Number(governorKPI.t3_kill_dif).toLocaleString("en-US"),
        t4KillDif: Number(governorKPI.t4_kill_dif).toLocaleString("en-US"),
        t5KillDif: Number(governorKPI.t5_kill_dif).toLocaleString("en-US"),
        deadDif: Number(governorKPI.dead_dif).toLocaleString("en-US"),
        kpi: Number(kpi),
        kpiNeeded: Number(kpiNeeded),
        kpiRemaining: Number(Math.round(kpiRemaining * 10) / 10),
        percentageTowardsGoal:
            Number(Math.round((kpi / kpiNeeded) * 100 * 100 + Number.EPSILON) / 100),
        deadRequirement: deadRequirement,
    };
};
