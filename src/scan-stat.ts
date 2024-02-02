import { setTimeout } from "node:timers/promises";
import type { PrismaClient } from "@prisma/client";
import type { Device } from "adb-ts";
import sharp from "sharp";
import { OEM, PSM, createWorker } from "tesseract.js";
import {createGovernorTracking, updateGovernorKPI, upsertGovernorKPI} from "./util/governor-kpi.js";
import {checkAppRunning, closeRok, rebootRoK} from "./util/reboot-rok.js";
import {scanProfile} from "./scan-profile.js";

const E_POS = {
  GOVERNOR_PROFILE_BUTTON: "50 40",
  GOVERNOR_PROFILE_CLOSE_BUTTON: "1090 80",
  RANKINGS_BUTTON: "400 590",
  MORE_INFO_BUTTON:"281 590",
  MORE_INFO_CLOSE_BUTTON: "1118 45",
  COPY_NAME_BUTTON:"300 125",
  KILL_POINT_BUTON:"893 251",
  KILL_RANKINGS_BUTTON_CLOSE: "1118 45",
  KILL_RANKINGS_BUTTON: "658 413",
  POWER_RANKINGS_BUTTON: "290 413",
  PROFILE_PREVIEW_X: 270,
  PROFILE_PREVIEW_Y: [220, 300, 380, 460, 490, 562],
  KILL_RANK_LABEL:{
    left: 444,
    top: 30,
    width: 420,
    height: 30,
  },
  PROFILE_LABEL:{
    left: 480,
    top: 64,
    width: 310,
    height: 40,
  },
  ALLIANCE_TEXT: {
    left: 475,
    top: 260,
    width: 200,
    height: 34,
  },
  POWER_TEXT: {
    left: 700,
    top: 260,
    width: 140,
    height: 28,
  },
  GOVERNOR_ID_TEXT: {
    left: 588,
    top: 155,
    width: 100,
    height: 30,
  },
  KILL_POINTS_LABEL: {
    left: 900,
    top: 260,
    width: 222,
    height: 40,
  },
  KILL_TIER_AREA: {
    left: 687,
    top: 334,
    width: 105,
    height: 170,
  },
  T1_KILL_TXT:{
    left: 689,
    top: 342,
    width: 100,
    height: 25,
  },
  T2_KILL_TEXT:{
    left: 689,
    top: 376,
    width: 100,
    height: 25,
  },
  T3_KILL_TEXT:{
    left: 689,
    top: 411,
    width: 100,
    height: 25,
  },
  T4_KILL_TEXT:{
    left: 689,
    top: 447,
    width: 100,
    height: 25,
  },
  T5_KILL_TEXT:{
    left: 689,
    top: 480,
    width: 100,
    height: 25,
  },
  DEAD_TEXT: {
    left: 927,
    top: 355,
    width: 167,
    height: 40,
  },
  RES_ASISTANCE_TEXT: {
    left: 900,
    top: 541,
    width: 167,
    height: 40,
  },
  GOVERNOR_NAME:{
    left: 310,
    top: 100,
    width: 200,
    height: 45,
  }
} as const;

const ANIMATION_DURATION = 500;
export const scanStat = async (
    device: Device,
    top: number,
    prisma: PrismaClient,
    newKvK: boolean,
    resetPower: boolean,
    resetKp: boolean,
) => {
  console.log("Start Scan Stat");
  const worker = await createWorker();

  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  let fails = 0;

  let beforeFail = 0;
  //Check Rok Running
  const isRunning = await checkAppRunning(device);
  if(!isRunning){
    await rebootRoK(device);
  }

  // Take Screen
  const profileSrc = await sharp(await device.screenshot())
      .grayscale()
      .jpeg()
      .toBuffer();
  await setTimeout(ANIMATION_DURATION);

  await worker.setParameters({
    tessedit_ocr_engine_mode: "4" as unknown as OEM,
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ ",
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
  });
  const {
    data: { text: getLabel },
  } = await worker.recognize(profileSrc, {
    rectangle: E_POS.KILL_RANK_LABEL,
  });
  console.log('#### "' + getLabel.trim() + '" #####');
  switch (getLabel.trim()){
    case "MORE INFO":
      // Close More Info
      await device.shell(`input tap ${E_POS.MORE_INFO_CLOSE_BUTTON}`);
      await setTimeout(ANIMATION_DURATION);
      // Close More Info
      await device.shell(`input tap ${E_POS.GOVERNOR_PROFILE_CLOSE_BUTTON}`);
      await setTimeout(ANIMATION_DURATION);
      break;
    case "INDIVIDUAL KILL RANKINGS":
      break;
    case "INDIVIDUAL POWER RANKINGS":
      break;
    default:
      await device.shell(`input tap ${E_POS.GOVERNOR_PROFILE_BUTTON}`);
      await setTimeout(ANIMATION_DURATION);

      // Open Rankings
      await device.shell(`input tap ${E_POS.RANKINGS_BUTTON}`);
      await setTimeout(ANIMATION_DURATION);

      // Open individual kill rankings
      /*await device.shell(`input tap ${E_POS.KILL_RANKINGS_BUTTON}`);
      await setTimeout(ANIMATION_DURATION);*/

      // Open individual POWER rankings
      await device.shell(`input tap ${E_POS.POWER_RANKINGS_BUTTON}`);
      await setTimeout(ANIMATION_DURATION);
  }

  for (let i = 0; i < top; i++) {

    await setTimeout(ANIMATION_DURATION);
    if (beforeFail > 5) {
      throw new Error("Failed to open governor profile over 5 times.");
    }

    const NEXT_CLICK_POS = i > 4 ? 4 : i;
    if(beforeFail>0){
      //Take Screenshot
      const scr = await sharp(await device.screenshot())
          .grayscale()
          .jpeg()
          .toBuffer();
      await setTimeout(ANIMATION_DURATION);

      await worker.setParameters({
        tessedit_ocr_engine_mode: "4" as unknown as OEM,
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ ",
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      });
      //Get Label Name
      const {
        data: {text: getLabel},
      } = await worker.recognize(scr, {
        rectangle: E_POS.PROFILE_LABEL,
      });
      console.log('++++++ '+getLabel.trim()+" +++++")
      if (getLabel.trim() == 'MORE INFO') {
        // Close More Info
        await device.shell(`input tap ${E_POS.MORE_INFO_CLOSE_BUTTON}`);
        await setTimeout(ANIMATION_DURATION);
      }else if(NEXT_CLICK_POS==4){
        // If 4th position Error
        await device.shell(`input swipe ${E_POS.PROFILE_PREVIEW_X} ${E_POS.PROFILE_PREVIEW_Y[4]} ${E_POS.PROFILE_PREVIEW_X} ${E_POS.PROFILE_PREVIEW_Y[4]-35}`);
        await setTimeout(ANIMATION_DURATION);
      }
    }

    await device.shell(`input tap ${E_POS.PROFILE_PREVIEW_X} ${E_POS.PROFILE_PREVIEW_Y[NEXT_CLICK_POS]}`);
    await setTimeout(ANIMATION_DURATION);

    try{
      const res = await scanProfile(device);
      beforeFail = 0;
      console.log(res);
      if (!newKvK) {
        await updateGovernorKPI(prisma, res);
      } else {
        await upsertGovernorKPI(prisma, res, resetPower, resetKp);
      }
      await createGovernorTracking(prisma, res);
    }catch (e){
      console.log(e);

      beforeFail++;
    }
  }
  // Close individual kill rankings
  await device.shell(
      `input tap ${E_POS.KILL_RANKINGS_BUTTON_CLOSE}`,
  );
  await setTimeout(ANIMATION_DURATION);

  // Close Ranking
  await device.shell(
      `input tap 1119 46`,
  );
  await setTimeout(ANIMATION_DURATION);

  // Close Profile
  await device.shell(
      `input tap 1088 80`,
  );
  await setTimeout(ANIMATION_DURATION);

  await worker.terminate();
  await closeRok(device);
};
