import type {Governor} from "@prisma/client";
import {EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {GovernorType, type CommandExecutionContext} from "../types.js";

const createGovernorStatsEmbed = (governor: Governor) => {
    return new EmbedBuilder()
        .setColor("#d3b9da")
        .setTitle(`Stat for ${governor.governor_name}`)
        .addFields([
            {
                name: "Governor ID",
                value: governor.governor_id,
                inline: true,
            },
            {
                name: "Power",
                value: Number(governor.power).toLocaleString("en-US"),
                inline: true,
            },
            {
                name: "Kill Point",
                value: Number(governor.kill_point).toLocaleString("en-US"),
                inline: true,
            },
            {
                name: "T1 Kill",
                value: Number(governor.t1_kill).toLocaleString("en-US"),
                inline: true,
            },
            {
                name: "T2 Kill",
                value: Number(governor.t2_kill).toLocaleString("en-US"),
                inline: true,
            },
            {
                name: "T3 Kill",
                value: Number(governor.t3_kill).toLocaleString("en-US"),
                inline: true,
            },
            {
                name: "T4 Kill",
                value: Number(governor.t4_kill).toLocaleString("en-US"),
                inline: true,
            },
            {
                name: "T5 Kill",
                value: Number(governor.t5_kill).toLocaleString("en-US"),
                inline: true,
            },
            {
                name: "Dead",
                value: Number(governor.dead).toLocaleString("en-US"),
                inline: true,
            },
            {
                name: "Resource Assistance",
                value: Number(governor.resource_assistance).toLocaleString("en-US"),
                inline: true,
            },
        ])
        .setFooter({
            text: `Last update: ${governor.updated_at}`,
        });
};

export const statsCommand = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("View governor profile statistics")
        .addStringOption((option) =>
            option
                .setName("id")
                .setDescription("Governor ID (Defaults to your own if not provided)")
                .setMinLength(4)
        )
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("Governor type (Defaults to main)")
                .addChoices(
                    ...Object.entries(GovernorType).map(([name, value]) => ({
                        name,
                        value,
                    }))
                )
        )
        .toJSON(),
    execute: async ({interaction, prisma}: CommandExecutionContext) => {
        await interaction.deferReply();

        const governorType = interaction.options.getString(
            "type"
        ) as GovernorType | null;

        const governorID = interaction.options.getString("id");

        if (governorID) {
            const governor = await prisma.governor.findFirst({
                where: {
                    governor_id: governorID,
                },
            });

            if (!governor) {
                return interaction.followUp(
                    "No KPI stats found. Either provide the id of a governor to view it's stats or use the `/link` command to link your account."
                );
            }

            return interaction.followUp({
                embeds: [createGovernorStatsEmbed(governor)],
            });
        }

        const governor = await prisma.governor.findFirst({
            where: {
                governorLink: {
                    some: {
                        discord_user_id: interaction.user.id,
                        governor_type: governorType ?? GovernorType.MAIN,
                    }
                },
            },
        });

        if (!governor) {
            return interaction.followUp("Could not find a governor");
        }

        return interaction.followUp({
            embeds: [createGovernorStatsEmbed(governor)],
        });
    },
};
