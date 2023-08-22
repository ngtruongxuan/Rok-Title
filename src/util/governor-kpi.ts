import type {Governor, PrismaClient} from "@prisma/client";
import {config} from "../config.js";

export const updateGovernorKPI = async (
    prisma: PrismaClient,
    governor: Omit<Governor, "created_at" | "updated_at">
) => {
    const existingGovernorKpi = await prisma.governorKPI.findFirst({
        where: {
            governor_id: governor.governor_id,
        },
        include: {
            governor: true,
        },
    });

    if (existingGovernorKpi) {
        return prisma.governorKPI.update({
            where: {
                governor_id: existingGovernorKpi.governor_id,
            },
            data: {
                power_dif: (
                    Number(governor.power) - Number(existingGovernorKpi.governor.power)
                ).toString(),
                t1_kill_dif: (
                    Number(governor.t1_kill) -
                    Number(existingGovernorKpi.governor.t1_kill)
                ).toString(),
                t2_kill_dif: (
                    Number(governor.t2_kill) -
                    Number(existingGovernorKpi.governor.t2_kill)
                ).toString(),
                t3_kill_dif: (
                    Number(governor.t3_kill) -
                    Number(existingGovernorKpi.governor.t3_kill)
                ).toString(),
                t4_kill_dif: (
                    Number(governor.t4_kill) -
                    Number(existingGovernorKpi.governor.t4_kill)
                ).toString(),
                t5_kill_dif: (
                    Number(governor.t5_kill) -
                    Number(existingGovernorKpi.governor.t5_kill)
                ).toString(),
                dead_dif: (
                    Number(governor.dead) - Number(existingGovernorKpi.governor.dead)
                ).toString(),
                updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
            },
        });
    }

    return prisma.governorKPI.create({
        data: {
            power_dif: 0,
            t1_kill_dif: 0,
            t2_kill_dif: 0,
            t3_kill_dif: 0,
            t4_kill_dif: 0,
            t5_kill_dif: 0,
            dead_dif: 0,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            governor: {
                connectOrCreate: {
                    where: {
                        governor_id: governor.governor_id,
                    },
                    create: governor,
                },
            },
        },
    });
};

export const upsertGovernorKPI = async (
    prisma: PrismaClient,
    governor: Omit<Governor, "created_at" | "updated_at">,
    resetPower: boolean,
    resetKp: boolean
) => {
    await prisma.governor.upsert({
        where: {
            governor_id: governor.governor_id,
            kingdom:config.get('kingdom.home'),
        },
        create: governor,
        update: {
            governor_name: governor.governor_name,
            ...(resetPower && {power: governor.power}),
            ...(resetKp && {
                kill_point: governor.kill_point,
                t1_kill: governor.t1_kill,
                t2_kill: governor.t2_kill,
                t3_kill: governor.t3_kill,
                t4_kill: governor.t4_kill,
                t5_kill: governor.t5_kill,
                dead: governor.dead,
                resource_assistance: governor.resource_assistance,
                updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
            }),
            governorKPI: {
                upsert: {
                    update: {
                        ...(resetPower && {power_dif: 0}),
                        ...(resetKp && {
                            t1_kill_dif: 0,
                            t2_kill_dif: 0,
                            t3_kill_dif: 0,
                            t4_kill_dif: 0,
                            t5_kill_dif: 0,
                            dead_dif: 0,
                            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                        }),
                    },
                    create: {
                        power_dif: 0,
                        t1_kill_dif: 0,
                        t2_kill_dif: 0,
                        t3_kill_dif: 0,
                        t4_kill_dif: 0,
                        t5_kill_dif: 0,
                        dead_dif: 0,
                        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
                    },
                },
            },
        },
    });
};

export const createGovernorTracking = async (
    prisma: PrismaClient,
    governor: Omit<Governor, "created_at" | "updated_at">,
) => {
    const curDate = new Date().toISOString().slice(0, 10);
    const isExist =  await prisma.governorTracking.findFirst({
        where:{
            governor_id: governor.governor_id,
            kingdom:config.get('kingdom.home'),
            date_scan: curDate,
        }
    });
    if(isExist){
        await prisma.governorTracking.update({
            where:{id:isExist.id},
            data:{
                governor_name: governor.governor_name,
                alliance_name: governor.alliance_name,
                power: governor.power,
                kill_point: governor.kill_point,
                t1_kill: governor.t1_kill,
                t2_kill: governor.t2_kill,
                t3_kill: governor.t3_kill,
                t4_kill: governor.t4_kill,
                t5_kill: governor.t5_kill,
                dead: governor.dead,
                resource_assistance: governor.resource_assistance,
                updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
        })
    }
    else{
        await prisma.governorTracking.create({
            data: {
                kingdom: config.get('kingdom.home'),
                governor_id: governor.governor_id,
                governor_name: governor.governor_name,
                alliance_name: governor.alliance_name,
                power: governor.power,
                date_scan: curDate,
                kill_point: governor.kill_point,
                t1_kill: governor.t1_kill,
                t2_kill: governor.t2_kill,
                t3_kill: governor.t3_kill,
                t4_kill: governor.t4_kill,
                t5_kill: governor.t5_kill,
                dead: governor.dead,
                resource_assistance: governor.resource_assistance,
                created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            },
        });
    }
};
