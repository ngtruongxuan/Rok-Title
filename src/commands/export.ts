import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import writeXlsxFile from "write-excel-file/node";
import type { CommandExecutionContext } from "../types.js";
import { calculateKpi } from "../util/calculate-kpi.js";

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

export const exportCommand = {
  data: new SlashCommandBuilder()
    .setName("export-kvk")
    .setDescription("Export KvK progress to an Excel file")
    .toJSON(),
  execute: async ({ interaction, prisma }: CommandExecutionContext) => {
    await interaction.deferReply();

    const governorKPI = await prisma.governorKPI.findMany({
      include: {
        governor: true,
      },
    });

    const kpis = governorKPI
      .map(calculateKpi)
      // .map(({ powerDif, percentageTowardsGoal, ...kpi }) => kpi);

    const HEADER_ROW = [
      {
        value: "Governor ID",
        fontWeight: "bold",
      },
      {
        value: "Governor Name",
        fontWeight: "bold",
      },
      {
        value: "Power",
        fontWeight: "bold",
      },
      {
        value: "Power Difference",
        fontWeight: "bold",
      },
      {
        value: "T1 Kill Dif",
        fontWeight: "bold",
      },
      {
        value: "T2 Kill Dif",
        fontWeight: "bold",
      },
      {
        value: "T3 Kill Dif",
        fontWeight: "bold",
      },
      {
        value: "T4 Kill Dif",
        fontWeight: "bold",
      },
      {
        value: "T5 Kill Dif",
        fontWeight: "bold",
      },
      {
        value: "Dead Difference",
        fontWeight: "bold",
      },
      {
        value: "Current KPI",
        fontWeight: "bold",
      },
      {
        value: "KPI needed",
        fontWeight: "bold",
      },
      {
        value: "KPI remaining",
        fontWeight: "bold",
      },
      {
        value: "Percentage Towards Goal",
        fontWeight: "bold",
      },
      {
        value: "Dead Requirement",
        fontWeight: "bold",
      },
    ];

    const DATA_ROWS = kpis.flatMap((kpi) =>
      Object.values(kpi).map((value) => ({
        type: typeof value === "number" ? Number : String,
        value,
      })),
    );

    const buffer = await writeXlsxFile(
      [HEADER_ROW, ...chunks(DATA_ROWS, HEADER_ROW.length)],
      {
        buffer: true,
      },
    );

    return interaction.followUp({
      files: [
        new AttachmentBuilder(buffer, {
          name: "kvk_kpi.xlsx",
          description: "KvK DKP export",
        }),
      ],
    });
  },
};
