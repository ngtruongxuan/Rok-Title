import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import type { PrismaClient } from "@prisma/client";
import type { Device } from "adb-ts";
import clipboard from "clipboardy";
import sharp from "sharp";
import { OEM, PSM, createWorker } from "tesseract.js";
import { findCutoutPosition, checkExist } from "./util/find-cutout-position.js";
import { updateGovernorDKP, upsertGovernorDKP } from "./util/governor-dkp.js";
import {checkAppRunning, closeRok, rebootRoK} from "./util/reboot-rok.js";

const ELEMENT_POSITIONS = {
  GOVERNOR_PROFILE_BUTTON: "50 40",
  GOVERNOR_PROFILE_CLOSE_BUTTON: "1090 80",
  RANKINGS_BUTTON: "400 590",
  MORE_INFO_BUTTON:"281 590",
  MORE_INFO_CLOSE_BUTTON: "1118 45",
  COPY_NAME_BUTTON:"300 125",
  KILL_POINT_BUTON:"893 251",
  KILL_RANKINGS_BUTTON_CLOSE: "1118 45",
  KILL_RANKINGS_BUTTON: "658 413",
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
  ALLIANCE_LABEL: {
    left: 475,
    top: 260,
    width: 200,
    height: 34,
  },
  POWER_LABEL: {
    left: 700,
    top: 260,
    width: 140,
    height: 28,
  },
  GOVERNOR_ID_LABEL: {
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
  KILL_TIER_LABELS: {
    left: 687,
    top: 334,
    width: 105,
    height: 170,
  },
  T1_KILL_LABEL:{
    left: 689,
    top: 342,
    width: 100,
    height: 25,
  },
  T2_KILL_LABEL:{
    left: 689,
    top: 376,
    width: 100,
    height: 25,
  },
  T3_KILL_LABEL:{
    left: 689,
    top: 411,
    width: 100,
    height: 25,
  },
  T4_KILL_LABEL:{
    left: 689,
    top: 447,
    width: 100,
    height: 25,
  },
  T5_KILL_LABEL:{
    left: 689,
    top: 480,
    width: 100,
    height: 25,
  },
  DEAD_LABELS: {
    left: 927,
    top: 355,
    width: 167,
    height: 40,
  },
  RES_ASISTANCE: {
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

const ANIMATION_DURATION = 1000;
export const scanGovernorStats = async (
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

  // Open governor profile
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
    rectangle: ELEMENT_POSITIONS.KILL_RANK_LABEL,
  });
  console.log('#### "' + getLabel.trim() + '" #####');
  // if(getLabel == "MORE INFO"){
  //   // Close More Info
  //   await device.shell(`input tap ${ELEMENT_POSITIONS.MORE_INFO_CLOSE_BUTTON}`);
  //   await setTimeout(ANIMATION_DURATION);
  //   // Close More Info
  //   await device.shell(`input tap ${ELEMENT_POSITIONS.GOVERNOR_PROFILE_CLOSE_BUTTON}`);
  //   await setTimeout(ANIMATION_DURATION);
  // }
  if(getLabel != "INDIVIDUAL KILL RANKINGS"){
    await device.shell(`input tap ${ELEMENT_POSITIONS.GOVERNOR_PROFILE_BUTTON}`);

    await setTimeout(ANIMATION_DURATION);

    // Open Rankings
    await device.shell(`input tap ${ELEMENT_POSITIONS.RANKINGS_BUTTON}`);

    await setTimeout(ANIMATION_DURATION);

    // Open individual kill rankings
    await device.shell(`input tap ${ELEMENT_POSITIONS.KILL_RANKINGS_BUTTON}`);

    await setTimeout(ANIMATION_DURATION);
  }

  for (let i = 0; i < top; i++) {
    await setTimeout(ANIMATION_DURATION);
    if (beforeFail > 5) {
      throw new Error("Failed to open governor profile over 250 times.");
    }

    const NEXT_CLICK_POS = i > 4 ? 4 : i;

    // Open governor profile
    if(beforeFail){
      const moreInfoScr = await sharp(await device.screenshot())
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
      } = await worker.recognize(moreInfoScr, {
        rectangle: ELEMENT_POSITIONS.KILL_RANK_LABEL,
      });
      console.log('#2 "' + getLabel + '" ');
      if(getLabel == "MORE INFO"){
        // Close More Info
        await device.shell(`input tap ${ELEMENT_POSITIONS.MORE_INFO_CLOSE_BUTTON}`);
        await setTimeout(ANIMATION_DURATION);
      }else{
        await device.shell(
            `input tap ${ELEMENT_POSITIONS.PROFILE_PREVIEW_X} ${ELEMENT_POSITIONS.PROFILE_PREVIEW_Y[5]}`,
        );
      }
    }else{
      await device.shell(
          `input tap ${ELEMENT_POSITIONS.PROFILE_PREVIEW_X} ${ELEMENT_POSITIONS.PROFILE_PREVIEW_Y[NEXT_CLICK_POS]}`,
      );
    }
    await setTimeout(2500);

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
      rectangle: ELEMENT_POSITIONS.PROFILE_LABEL,
    });
    console.log('#### "' + getLabel.trim() + '" #####');
    if (getLabel.trim() != 'GOVERNOR PROFILE') {
      fails++;
      beforeFail++;
      continue;
    }else{
      beforeFail = 0;
      await worker.setParameters({
        tessedit_ocr_engine_mode: "4" as unknown as OEM,
        tessedit_char_whitelist: "0123456789",
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
      });

      const {
        data: { text: power },
      } = await worker.recognize(profileSrc, {
        rectangle: ELEMENT_POSITIONS.POWER_LABEL,
      });

      const {
        data: { text: killPoints },
      } = await worker.recognize(profileSrc, {
        rectangle: ELEMENT_POSITIONS.KILL_POINTS_LABEL,
      });

      const {
        data: { text: governorID },
      } = await worker.recognize(profileSrc, {
        rectangle: ELEMENT_POSITIONS.GOVERNOR_ID_LABEL,
      });

      // Open kill statistics
      await device.shell(
          `input tap ${ELEMENT_POSITIONS.KILL_POINT_BUTON}`,
      );
      await setTimeout(ANIMATION_DURATION);

      //Kill Statistic
      const killStatisticsScr = await sharp(await device.screenshot())
          .threshold(210)
          .blur(0.75)
          .toBuffer();
      await setTimeout(ANIMATION_DURATION);

      await worker.setParameters({
        tessedit_ocr_engine_mode: "4" as unknown as OEM,
        tessedit_char_whitelist: "0123456789",
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      });

      const {
        data: { text: t1Kill },
      } = await worker.recognize(killStatisticsScr, {
        rectangle: ELEMENT_POSITIONS.T1_KILL_LABEL,
      });
      const {
        data: { text: t2Kill },
      } = await worker.recognize(killStatisticsScr, {
        rectangle: ELEMENT_POSITIONS.T2_KILL_LABEL,
      });
      const {
        data: { text: t3Kill },
      } = await worker.recognize(killStatisticsScr, {
        rectangle: ELEMENT_POSITIONS.T3_KILL_LABEL,
      });
      const {
        data: { text: t4Kill },
      } = await worker.recognize(killStatisticsScr, {
        rectangle: ELEMENT_POSITIONS.T4_KILL_LABEL,
      });
      const {
        data: { text: t5Kill },
      } = await worker.recognize(killStatisticsScr, {
        rectangle: ELEMENT_POSITIONS.T5_KILL_LABEL,
      });
      const tierKills = {
        tier1kp:t1Kill.trim(),
        tier2kp:t2Kill.trim(),
        tier3kp:t3Kill.trim(),
        tier4kp:t4Kill.trim(),
        tier5kp:t5Kill.trim(),
      };
      console.log(tierKills);

      // Open More Info
      await device.shell(
          `input tap ${ELEMENT_POSITIONS.MORE_INFO_BUTTON}`,
      );

      await setTimeout(ANIMATION_DURATION);

      const moreInfoScr = await sharp(await device.screenshot())
          .grayscale()
          .jpeg()
          .toBuffer();
      await device.shell(
          `input tap ${ELEMENT_POSITIONS.COPY_NAME_BUTTON}`,
      );
      await setTimeout(ANIMATION_DURATION);

      const governorName = await clipboard.read();

      /*await worker.setParameters({
        tessedit_ocr_engine_mode: "4" as unknown as OEM,
        tessedit_char_whitelist: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ",
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      });
      const {
        data: { text: nickName },
      } = await worker.recognize(moreInfoScr, {
        rectangle: ELEMENT_POSITIONS.GOVERNOR_NAME,
      });

      console.log("GovernorName "+nickName.trim());*/

      const {
        data: { text: dead },
      } = await worker.recognize(moreInfoScr, {
        rectangle: ELEMENT_POSITIONS.DEAD_LABELS,
      });

      const {
        data: { text: resourceAssistance },
      } = await worker.recognize(moreInfoScr, {
        rectangle: ELEMENT_POSITIONS.RES_ASISTANCE,
      });

      // Close More Info
      await device.shell(`input tap ${ELEMENT_POSITIONS.MORE_INFO_CLOSE_BUTTON}`);
      await setTimeout(ANIMATION_DURATION);

      // Close Governor Profile
      await device.shell(
          `input tap ${ELEMENT_POSITIONS.GOVERNOR_PROFILE_CLOSE_BUTTON}`,
      );
      await setTimeout(ANIMATION_DURATION);

      console.log(["---------",governorName.trim(),governorID.trim(),power.trim(),killPoints.trim(),dead.trim(),resourceAssistance.trim(),"---------"].join(' '))
      if (
          !governorName ||
          !power ||
          !killPoints ||
          !governorID ||
          !dead ||
          !resourceAssistance ||
          Object.values(tierKills).some((tierKills) => !tierKills)
      ) {
        continue;
      }

      const governor = {
        nickname: governorName,
        power: power.trim(),
        kp: killPoints.trim(),
        id: governorID.trim(),
        ...tierKills,
        dead,
        resourceAssistance,
      };

      if (!newKvK) {
        await updateGovernorDKP(prisma, governor);
      } else {
        await upsertGovernorDKP(prisma, governor, resetPower, resetKp);
      }
    }

  }

  // Close individual kill rankings
  await device.shell(
      `input tap ${ELEMENT_POSITIONS.KILL_RANKINGS_BUTTON_CLOSE}`,
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
