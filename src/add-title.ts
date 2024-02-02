import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import type { Device } from "adb-ts";
import { type Logger } from "pino";
import { OEM, PSM, createWorker } from "tesseract.js";
import { config } from "./config.js";
import { Kingdom, type Title } from "./types.js";
import {findCutoutPosition, findPosition} from "./util/find-cutout-position.js";
import {
  checkAppRunning, closeRok,
  getLastVisitedKingdom,
  getPixelHexColour,
  rebootRoK,
  setLastVisitedKingdom,
} from "./util/util.module.js";
import sharp from "sharp";

export interface AddTitleOptions {
  device: Device;
  title: Title;
  logger: Logger;
  kingdom: Kingdom;
  x: number;
  y: number;
}

const E_POS = {
  COORDINATES_SEARCH_BUTTON: "437 18",
  KINGDOM_ID_INPUT: "441 143",
  INPUT_OK_BUTTON: "1147 636",
  X_COORDINATE_INPUT: "628 145",
  Y_COORDINATE_INPUT: "766 144",
  COORDINATES_OVERLAY_SEARCH_BUTTON: "887 141",
  CITY_LOCATIONS: ["617 396", "720 311"/*, "803 449.5"*/],
  JUSTICE_TITLE_CHECKBOX: "290 384",
  DUKE_TITLE_CHECKBOX: "520 384",
  ARCHITECT_TITLE_CHECKBOX: "748 384",
  SCIENTIST_TITLE_CHECKBOX: "978 384",
  CONFIRM_BUTTON: "652 642",
  TITLE_OVERLAY_CLOSE_BUTTON: "1122 45",
  ONLINE_STATUS_INDICATOR: "95 9",
  MAP_LOCATION: "66 650",
  KD_TXT: {
    left: 290,
    top: 7,
    width: 35,
    height: 20,
  }
} as const;

const QUICK_TRAVEL_TIMEOUT = 4_000;
const SLOW_TRAVEL_TIMEOUT = 5000;
const UI_ELEMENT_ANIMATION_DURATION = 750;
const NEW_CLICK_IDLE_TIMEOUT = 100;
const MAP_ANIMATION_DURATION = 1500;

export const addTitle = async ({
  device,
  title,
  logger: _logger,
  kingdom,
  x,
  y,
}: AddTitleOptions) => {
  /*const onlineStatusIndicatorHexColour = await getPixelHexColour(
    await device.screenshot(),
    ...(ELEMENT_POSITIONS.ONLINE_STATUS_INDICATOR.split(" ").map(Number) as [
      number,
      number,
    ]),
  );

  const ONLINE_STATUS_INDICATOR_HEX = "#e30000";

  if (onlineStatusIndicatorHexColour !== ONLINE_STATUS_INDICATOR_HEX) {
    await rebootRoK(device);

    // Tap map
    await device.shell(`input tap ${ELEMENT_POSITIONS.MAP_LOCATION}`);

    await setTimeout(MAP_ANIMATION_DURATION);
  }*/

  //Check Rok Running
  const isRunning = await checkAppRunning(device);
  if(!isRunning){
    await rebootRoK(device);
    await device.shell(`input tap ${E_POS.MAP_LOCATION}`);
    await setTimeout(MAP_ANIMATION_DURATION);
  }
  const worker = await createWorker();

  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  await worker.setParameters({
    tessedit_ocr_engine_mode: "4" as unknown as OEM,
    tessedit_char_whitelist: "0123456789C",
    tessedit_pageseg_mode: PSM.SPARSE_TEXT,
  });


  const SCREENSHOT_PATH = join(process.cwd(), "temp", "screenshot.jpg");
  await writeFile(SCREENSHOT_PATH, await device.screenshot());

  const BUILD_PATH = join(process.cwd(),"resources","build_btn.png");
  const buildBtn = await findPosition(SCREENSHOT_PATH,BUILD_PATH);

  const SEARCH_PATH = join(process.cwd(),"resources","search.png");
  const searchBtn = await findPosition(SCREENSHOT_PATH,SEARCH_PATH);

  //Check is view City or Not
  // console.log(buildBtn);
  if(searchBtn.p<0.6){
    await rebootRoK(device);
    await device.shell(`input tap ${E_POS.MAP_LOCATION}`);
    await setTimeout(MAP_ANIMATION_DURATION);
  }

  /*const viewScr = await sharp(await device.screenshot())
      .grayscale()
      .jpeg()
      .toBuffer();
  await setTimeout(MAP_ANIMATION_DURATION);

  //Check is view City or Not
  const {
    data: {text: inCity},
  } = await worker.recognize(viewScr, {
    rectangle: E_POS.KD_TXT,
  });

  // console.log(inCity.trim());
  if(inCity.trim()==''){
    await device.shell(`input tap ${E_POS.MAP_LOCATION}`);
    await setTimeout(MAP_ANIMATION_DURATION);
  }*/

  const KINGDOM_INPUT_VALUE = config.get(
    `kingdom.${kingdom.toLowerCase() as Lowercase<Kingdom>}`,
  );

  // Open coordinates search overlay
  await device.shell(`input tap ${E_POS.COORDINATES_SEARCH_BUTTON}`);

  // Tap kingdom id input
  await device.shell(`input tap ${E_POS.KINGDOM_ID_INPUT}`);

  await setTimeout(MAP_ANIMATION_DURATION);
  // Remove existing input (https://stackoverflow.com/a/72186108)
  await device.shell(
    "input keyevent --longpress 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67 67",
  );

  // Enter kingdom id
  await device.shell(`input text ${KINGDOM_INPUT_VALUE}`);

  // Tap "OK"
  await device.shell(`input tap ${E_POS.INPUT_OK_BUTTON}`);

  // Tap x-coordinate input
  await device.shell(`input tap ${E_POS.X_COORDINATE_INPUT}`);
  await setTimeout(UI_ELEMENT_ANIMATION_DURATION);
  // Enter x-coordinate
  await device.shell(`input text ${x}`);

  // Tap "OK"
  await device.shell(`input tap ${E_POS.INPUT_OK_BUTTON}`);

  // Tap y-coordinate input
  await device.shell(`input tap ${E_POS.Y_COORDINATE_INPUT}`);
  await setTimeout(UI_ELEMENT_ANIMATION_DURATION);
  // Enter y-coordinate
  await device.shell(`input text ${y}`);

  // Tap "OK"
  await device.shell(`input tap ${E_POS.INPUT_OK_BUTTON}`);

  // Tap search button
  await device.shell(`input tap ${E_POS.COORDINATES_OVERLAY_SEARCH_BUTTON}`);
  await setTimeout(8000);


  // const isTravellingToNewKingdom = getLastVisitedKingdom() !== kingdom;
  // if(isTravellingToNewKingdom)
  //   await setTimeout(SLOW_TRAVEL_TIMEOUT);

  // await setTimeout(
  //   isTravellingToNewKingdom ? SLOW_TRAVEL_TIMEOUT : QUICK_TRAVEL_TIMEOUT,
  // );

  // setLastVisitedKingdom(kingdom);

  /*const getTitleButtonCoordinates = async (
    cityLocationIndex = 0,
  ): Promise<Record<"x" | "y", number>> => {
    if (cityLocationIndex > E_POS.CITY_LOCATIONS.length) {
      throw new Error("You might have entered the wrong coordinates.");
    }

    // console.log(cityLocationIndex)
    // Tap city
    await device.shell(`input tap ${E_POS.CITY_LOCATIONS[cityLocationIndex]}`);
    await setTimeout(UI_ELEMENT_ANIMATION_DURATION);

    const SCREENSHOT_PATH = join(process.cwd(), "temp", "screenshot.jpg");
    await writeFile(SCREENSHOT_PATH, await device.screenshot());
    await setTimeout(UI_ELEMENT_ANIMATION_DURATION);

    const ADD_TITLE_BUTTON_IMAGE_PATH = join(
        process.cwd(),
        "resources",
        // "add-title-button.jpg",
        "add-title-button2.png",
    );
    const addTitleButtoncoordinates = await findCutoutPosition(
      SCREENSHOT_PATH,
      ADD_TITLE_BUTTON_IMAGE_PATH
    );

    if (!addTitleButtoncoordinates) {
      return getTitleButtonCoordinates(cityLocationIndex + 1);
    }

    return addTitleButtoncoordinates;
  };*/

  // const addTitleButtoncoordinates = await getTitleButtonCoordinates();

  let xClick = 640;
  let yClick = 330;
  if(x<200 && y > 500 && y < 1000){
    // xClick = 660;
    yClick = 380;
  }
  if(x>400){
    xClick = 630;
    // yClick = 410;
  }
  if(x<100 && y>1000){
    xClick = 740;
    yClick = 361;
  }
  if(x>100 && y>1000){
    xClick = 640;
    yClick = 340;
  }
  if(x>410 && y>800){
    xClick = 650;
    yClick = 340;
  }
  if(x>200 && y < 1000){
    // xClick = 670;
    yClick = 350;
  }
  await device.shell(`input tap ${xClick} ${yClick}`);
  await setTimeout(UI_ELEMENT_ANIMATION_DURATION);

  await writeFile(SCREENSHOT_PATH, await device.screenshot());
  const TITLE_BTN = join(process.cwd(),"resources","add-title-button2.png");
  const titleBtn = await findPosition(SCREENSHOT_PATH,TITLE_BTN);
  console.log(new Date().toISOString().replace('T', ' ').substring(0, 19));
  console.log([`Governor (${x} ${y}) click ${xClick} ${yClick}`,titleBtn]);
  //Check Title Btn

  if(titleBtn.p<0.6){
    throw new Error("Could not find Title Button.");
  }

  // Tap title icon
  await device.shell(
    `input tap ${titleBtn.x+5} ${titleBtn.y+5}`,
      // `input tap 738 228`,
  );

  await setTimeout(UI_ELEMENT_ANIMATION_DURATION);

  const UNSELECTED_TITLE_CHECKBOX_BACKGROUND_COLOURS_HEX_START = "#00";

  const titleCheckboxHexColour = await getPixelHexColour(
    await device.screenshot(),
    ...(E_POS[
      `${title.toUpperCase() as Uppercase<Title>}_TITLE_CHECKBOX`
    ]
      .split(" ")
      .map(Number) as [number, number]),
  );

  const titleChecked = !titleCheckboxHexColour.startsWith(
    UNSELECTED_TITLE_CHECKBOX_BACKGROUND_COLOURS_HEX_START,
  );
  if (titleChecked) {
    // Press close button
    await device.shell(
      `input tap ${E_POS.TITLE_OVERLAY_CLOSE_BUTTON}`,
    );
    throw new Error(`You already have the ${title} title.`);
  }

  await setTimeout(UI_ELEMENT_ANIMATION_DURATION);
  // Tap selected title checkbox
  await device.shell(
    `input tap ${
      E_POS[
        `${title.toUpperCase() as Uppercase<Title>}_TITLE_CHECKBOX`
      ]
    }`,
  );

  await setTimeout(NEW_CLICK_IDLE_TIMEOUT);

  // Tap confirm button
  await device.shell(`input tap ${E_POS.CONFIRM_BUTTON}`);

  await setTimeout(UI_ELEMENT_ANIMATION_DURATION);

  await worker.terminate();
};
