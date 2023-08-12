import { setTimeout } from "node:timers/promises";
import type { Device } from "adb-ts";

const GAME_BOOT_TIMEOUT = 35_000;
export const MAP_POSITION = "75 825";

export const rebootRoK = async (device: Device) => {
  // Close Rise of Kingdoms
  await device.execShell("am force-stop com.lilithgame.roc.gp");

  // Open Rise of Kingdoms
  await device.execShell("monkey -p com.lilithgame.roc.gp 1");

  await setTimeout(GAME_BOOT_TIMEOUT);
};
export const closeRok = async (device: Device) => {
  // Close Rise of Kingdoms
  await device.execShell("am force-stop com.lilithgame.roc.gp");
};

export const checkAppRunning =async (device: Device) => {
  try{
    const pId = await device.execShell("pidof com.lilithgame.roc.gp");
    return pId;
  }
  catch (e){
    return false;
  }
};

