import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { GovernorType, type CommandExecutionContext } from "../types.js";
import { calculateKpi } from "../util/calculate-kpi.js";

export const kvkStatsCommand = {
  data: new SlashCommandBuilder()
    .setName("kvk-stats")
    .setDescription("View KvK statistics")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Governor type (Defaults to main)")
        .addChoices(
          ...Object.entries(GovernorType).map(([name, value]) => ({
            name,
            value,
          })),
        ),
    )
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("Governor ID (Defaults to your own if not provided)")
        .setMinLength(4),
    )
    .toJSON(),
  execute: async ({ interaction, prisma }: CommandExecutionContext) => {
    await interaction.deferReply({ ephemeral: true });

    const governorType =
      interaction.options.getString("type") ?? GovernorType.MAIN;

    const governorID = interaction.options.getString("id");

    const governorKpis = await prisma.governorKPI.findMany({
      include: {
        governor: {
          include: {
            governorLink: true,
          },
        },
      },
    });

    const governorKPI = governorKpis.find((governorKPI) =>
      governorID
        ? governorKPI.governor.governor_id === governorID
        : governorKPI.governor.governorLink.some(
            (governorLink) =>
                governorLink.discord_user_id === interaction.user.id &&
                governorLink.governor_type === governorType,
          ),
    );

    if (!governorKPI) {
      return interaction.followUp(
        "No dkp stats found. Either provide the id of a governor to view it's stats or use the `/link` command to link your account.",
      );
    }

    const dkpSorted = governorKpis
      .map(calculateKpi)
      .sort((a, b) => b.kpi - a.kpi);

    const dkp = dkpSorted.find(
      (dkp) => dkp.governorID === governorKPI.governor_id,
    );

    if (!dkp) {
      throw new Error("No dkp.");
    }

    const embed = new EmbedBuilder()
      .setColor("#d3b9da")
      .setTitle(`KvK stats for ${dkp.governorName}`)
      .addFields([
        {
          name: "Governor ID",
          value: dkp.governorID,
          inline: true,
        },
        {
          name: "Rank",
          value: `#${
            dkpSorted.findIndex(
              ({ governorID }) => governorID === dkp.governorID,
            ) + 1
          }`,
          inline: true,
        },
        {
          name: "Power",
          value: dkp.power,
          inline: true,
        },
        {
          name: "Power Dif",
          value: dkp.powerDif,
          inline: true,
        },
        {
          name: "T4 Killed",
          value: dkp.t4KillDif,
          inline: true,
        },
        {
          name: "T5 Killed",
          value: dkp.t5KillDif,
          inline: true,
        },
        {
          name: "Dead gained",
          value: dkp.deadDif,
          inline: true,
        },
        {
          name: "KPI",
          value: dkp.kpi.toString(),
          inline: true,
        },
        {
          name: "KPI Goal",
          value: dkp.kpiNeeded.toString(),
          inline: true,
        },
        {
          name: "Dead requirement",
          value: dkp.deadRequirement,
          inline: true,
        },
        {
          name: "Goal reached",
          value: `${
            dkp.percentageTowardsGoal > 100 ? 100 : dkp.percentageTowardsGoal
          }%`,
          inline: true,
        },
      ])
      .setFooter({
        text: `Last update: ${governorKPI.updated_at}`,
      });
    return interaction.followUp({ embeds: [embed] , ephemeral: true});
  },
};
