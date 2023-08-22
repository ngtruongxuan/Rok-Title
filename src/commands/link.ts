import { SlashCommandBuilder } from "discord.js";
import { GovernorType, type CommandExecutionContext } from "../types.js";

export const linkCommand = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link a governor profile to your Discord user")
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("Governor ID")
        .setMinLength(4)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Governor type")
        .addChoices(
          ...Object.entries(GovernorType).map(([name, value]) => ({
            name,
            value,
          }))
        )
        .setRequired(true)
    )
    .toJSON(),
  execute: async ({ interaction, prisma }: CommandExecutionContext) => {
    await interaction.deferReply();

    const governorID = interaction.options.getString("id", true);

    const governor = await prisma.governor.findUnique({
      where: {
        governor_id:governorID,
      },
    });

    if (!governor) {
      return interaction.followUp(
        `Could not find a governor with ID: **${governorID}**`
      );
    }

    const governorType = interaction.options.getString(
      "type",
      true
    ) as GovernorType;

    await prisma.governorLink.upsert({
      where: {
        discord_user_id:interaction.user.id
      },
      create: {
        discord_user_id: interaction.user.id,
        governor_id: governor.governor_id,
        governor_type:governorType,
        created_at:new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_at:new Date().toISOString().replace('T', ' ').substring(0, 19)
      },
      update: {
        governor_id: governor.governor_id,
        governor_type:governorType,
        updated_at:new Date().toISOString().replace('T', ' ').substring(0, 19)
      },
    });

    return interaction.followUp(
      `Succesfully linked **${governor.governor_name}** (${governorType}) to your Discord user`
    );
  },
};
