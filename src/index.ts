import { exec } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";
import {Client as AdbClient, Device} from "adb-ts";
import dotenv from "dotenv";
import {
  Client as DiscordClient,
  GatewayIntentBits,
  Events,
  ChannelType,
  codeBlock,
} from "discord.js";
import {Logger, pino} from "pino";
import * as commands from "./commands/commands.module.js";
import { config } from "./config.js";
import {scanStat} from "./scan-stat.js";
import {CommandExecutionContext, Kingdom, Title} from "./types.js";
import {checkAppRunning, closeRok} from "./util/reboot-rok.js";
import { addTitle } from "./add-title.js";

try{
  const execAsync = promisify(exec);

  const blueStacksConfig = await readFile(
      join("C:\\", "ProgramData", "BlueStacks_nxt", "bluestacks.conf"),
      "utf-8"
  );

  const BLUESTACKS_ADB_PORT = blueStacksConfig
      .split("\n")
      .find(
          (key) => key.startsWith("bst.instance") && key.includes("status.adb_port")
      )
      ?.split("=")
      .at(1)
      ?.replaceAll('"', "");

  if (!BLUESTACKS_ADB_PORT) {
    throw new Error("Could not find BlueStacks adb port.");
  }

  await execAsync('".\\platform\\adb\\adb.exe" kill-server');

  console.log(BLUESTACKS_ADB_PORT);
  await execAsync(
      `".\\platform\\adb\\adb.exe" connect localhost:${BLUESTACKS_ADB_PORT}`
  );

  const adb = new AdbClient({
    bin: join(process.cwd(), "platform\\adb", "adb.exe"),
    host: "127.0.0.1",
    port: 5037,
  });

  const [device] = await adb.map((device) => device);

  if (!device) {
    throw new Error("adb could not connect to a device.");
  }

  const logger = pino({ name: config.get("name") });

  const prisma = new PrismaClient({
    // log:
    //   process.env["NODE_ENV"] !== "production"
    //     ? ["query", "info"]
    //     : ["error", "warn"],
  });

  await prisma.$connect();
  // var ls = await device.shell('pm list packages');
  /*var ls = await device.shell('pm list packages');
  ls=ls.replace(/package:/g,"");
  ls=ls.split(/[\r\n]+/);
  if(ls.includes("com.rok.gp.vn"))
    console.log(1)
  console.log(ls);*/

  await scanStat(device, 300, prisma, false, false, false);
  console.log("Done");


  // const AddTitleOptions = {
  //   device: device,
  //   title: Title.DUKE,
  //   logger: logger,
  //   kingdom: Kingdom.HOME,
  //   x: 332,
  //   y: 326
  // }
  // await addTitle(AddTitleOptions);

  /*const discord = new DiscordClient({
    intents: [GatewayIntentBits.Guilds],
  });

  discord.once(Events.ClientReady, async (client) => {
    client.user.setActivity("Rise of Kingdoms");

    const guild = client.guilds.cache.get(config.get("discord.guild"));

    const commandData = Object.values(commands).map((command) => command.data);

    if (process.env["NODE_ENV"] !== "production") {
      await guild?.commands.set(commandData);
    } else {
      await guild?.commands.set([]);
      await client.application.commands.set(commandData);
    }

    logger.info(`Ready! Logged in as ${client.user.tag}.`);
  });

  discord.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    if (
        !interaction.inCachedGuild() ||
        interaction.channel?.type !== ChannelType.GuildText
    ) {
      return;
    }

    const command = Object.values(commands).find(
        (command) => command.data.name === interaction.commandName
    );

    if (!command) {
      throw new Error(`Command \`${interaction.commandName}\` was not found.`);
    }

    try {
      await command.execute({ interaction, device, prisma, logger });
      /!*const message = await interaction.fetchReply();
      console.log(message);*!/
    } catch (error) {
      logger.error(error);

      if (error instanceof Error) {
        await interaction.editReply({
          content: `Error:\n${codeBlock(error.message)}`,
          components: [],
        });
      }

    }
    // await closeRok(device);
  });
  await discord.login();*/
}catch (e){
  console.log(e)
}

