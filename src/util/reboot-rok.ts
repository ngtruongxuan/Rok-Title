import { setTimeout } from "node:timers/promises";
import type { Device } from "adb-ts";

const GAME_BOOT_TIMEOUT = 30000;
export const MAP_POSITION = "75 825";
// const packageName = "com.lilithgame.roc.gp";
const packageName = "com.rok.gp.vn";
export const checkVersion=async (device: Device)=>{
  var ls = await device.shell('pm list packages');
  ls=ls.replace(/package:/g,"");
  ls=ls.split(/[\r\n]+/);
  var verGamota = "com.rok.gp.vn";
  var verInternation = "com.lilithgame.roc.gp";
  if(ls.includes(verGamota))
    return verGamota;
  else if(ls.includes(verInternation)){
    return verInternation;
  }
  else
    return "";
}
export const rebootRoK = async (device: Device) => {
  // Close Rise of Kingdoms
  console.log(packageName);
  await device.execShell(`am force-stop ${packageName}`);

  // Open Rise of Kingdoms
  await device.execShell(`monkey -p ${packageName} 1`);

  await setTimeout(GAME_BOOT_TIMEOUT);
};
export const closeRok = async (device: Device) => {
  // Close Rise of Kingdoms  
  await device.execShell(`am force-stop ${packageName}`);
};

export const checkAppRunning =async (device: Device) => {
  try{
    const pId = await device.execShell(`pidof ${packageName}`);
    return pId;
  }
  catch (e){
    return false;
  }
};

