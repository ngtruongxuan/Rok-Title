import { setTimeout } from "node:timers/promises";
import type { Device } from "adb-ts";
import sharp from "sharp";
import {createWorker, OEM, PSM} from "tesseract.js";
import clipboard from "clipboardy";
import {config} from "./config.js";
import {isEmpty} from "rxjs";

const E_POS = {
    GOVERNOR_PROFILE_CLOSE_BUTTON: "1090 80",
    MORE_INFO_BUTTON:"281 590",
    MORE_INFO_CLOSE_BUTTON: "1118 45",
    COPY_NAME_BUTTON:"300 125",
    KILL_POINT_BUTON:"893 251",
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
        height: 27,
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
    RES_GATHERED:{
        left: 900,
        top: 490,
        width: 167,
        height: 40,
    },
    HELP_TIMES:{
        left: 900,
        top: 585,
        width: 167,
        height: 40,
    }
} as const;
const ANIMATION_DURATION = 550;

const worker = await createWorker();
await worker.loadLanguage("eng");
await worker.initialize("eng");
export const scanProfile = async (device: Device) => {
    //Take Screenshot Governor Profile
    await setTimeout(ANIMATION_DURATION);
    const profileSrc = await sharp(await device.screenshot())
        .grayscale()
        .jpeg()
        .toBuffer();
    await setTimeout(ANIMATION_DURATION);

    await worker.setParameters({
        tessedit_ocr_engine_mode: "4" as unknown as OEM,
        tessedit_char_whitelist: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ;:![] ",
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    });
    //Check Opening Popup GOVERNOR PROFILE
    const {
        data: {text: getLabel},
    } = await worker.recognize(profileSrc, {
        rectangle: E_POS.PROFILE_LABEL,
    });
    console.log('Label '+getLabel.trim());
    if (getLabel.trim() != 'GOVERNOR PROFILE') {
        throw new Error('Please open popup GOVERNOR PROFILE');
    }
    //Get Alliance
    const {
        data: {text: alliance},
    } = await worker.recognize(profileSrc, {
        rectangle: E_POS.ALLIANCE_TEXT,
    });

    await worker.setParameters({
        tessedit_ocr_engine_mode: "4" as unknown as OEM,
        tessedit_char_whitelist: "0123456789",
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
    });
    //Get ID
    const {
        data: {text: governorID},
    } = await worker.recognize(profileSrc, {
        rectangle: E_POS.GOVERNOR_ID_TEXT,
    });
    //Get Power
    const {
        data: {text: power},
    } = await worker.recognize(profileSrc, {
        rectangle: E_POS.POWER_TEXT,
    });
    //Get Kill Points
    const {
        data: {text: killPoints},
    } = await worker.recognize(profileSrc, {
        rectangle: E_POS.KILL_POINTS_LABEL,
    });

    // Open kill statistics
    await device.shell(
        `input tap ${E_POS.KILL_POINT_BUTON}`,
    );
    await setTimeout(ANIMATION_DURATION);

    //Kill Statistic
    const killStatisticsScr = await sharp(await device.screenshot())
        .grayscale()
        .jpeg()
        .toBuffer();
    await setTimeout(ANIMATION_DURATION);

    //Get T1 Kill
    const {
        data: {text: t1Kill},
    } = await worker.recognize(killStatisticsScr, {
        rectangle: E_POS.T1_KILL_TXT,
    });
    //Get T2 Kill
    const {
        data: {text: t2Kill},
    } = await worker.recognize(killStatisticsScr, {
        rectangle: E_POS.T2_KILL_TEXT,
    });
    //Get T3 Kill
    const {
        data: {text: t3Kill},
    } = await worker.recognize(killStatisticsScr, {
        rectangle: E_POS.T3_KILL_TEXT,
    });
    //Get T4 Kill
    const {
        data: {text: t4Kill},
    } = await worker.recognize(killStatisticsScr, {
        rectangle: E_POS.T4_KILL_TEXT,
    });
    //Get T5 Kill
    const {
        data: {text: t5Kill},
    } = await worker.recognize(killStatisticsScr, {
        rectangle: E_POS.T5_KILL_TEXT,
    });
    /*const tierKills = {
        tier1kp: t1Kill.trim(),
        tier2kp: t2Kill.trim(),
        tier3kp: t3Kill.trim(),
        tier4kp: t4Kill.trim(),
        tier5kp: t5Kill.trim(),
    };*/

    // Open More Info
    await device.shell(
        `input tap ${E_POS.MORE_INFO_BUTTON}`,
    );
    await setTimeout(ANIMATION_DURATION);
    //Take Screenshot More Info Popup
    const moreInfoScr = await sharp(await device.screenshot())
        .grayscale()
        .jpeg()
        .toBuffer();
    await device.shell(
        `input tap ${E_POS.COPY_NAME_BUTTON}`,
    );
    await setTimeout(ANIMATION_DURATION);
    //Get Governor Name
    const governorName = await clipboard.read();

    //Get Dead
    const {
        data: {text: dead},
    } = await worker.recognize(moreInfoScr, {
        rectangle: E_POS.DEAD_TEXT,
    });
    //Get Resource Assistance
    const {
        data: {text: resourceAssistance},
    } = await worker.recognize(moreInfoScr, {
        rectangle: E_POS.RES_ASISTANCE_TEXT,
    });

    //Get Resource Gathered
    const {
        data: {text: resourceGathered},
    } = await worker.recognize(moreInfoScr, {
        rectangle: E_POS.RES_GATHERED,
    });
    //Get Help Times
    const {
        data: {text: helpTimes},
    } = await worker.recognize(moreInfoScr, {
        rectangle: E_POS.HELP_TIMES,
    });

    // Close More Info
    await device.shell(`input tap ${E_POS.MORE_INFO_CLOSE_BUTTON}`);
    await setTimeout(ANIMATION_DURATION);

    // Close Governor Profile
    await device.shell(`input tap ${E_POS.GOVERNOR_PROFILE_CLOSE_BUTTON}`);
    await setTimeout(ANIMATION_DURATION);

    console.log(["---------", governorName.trim(), governorID.trim(), power.trim(), killPoints.trim(), dead.trim(), resourceAssistance.trim(), "---------"].join(' '))
    const curDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const governor = {
        kingdom:config.get('kingdom.home'),
        governor_id: governorID.trim(),
        governor_name: governorName.trim(),
        alliance_name: alliance.trim(),
        power: parseInt(power.trim()),
        kill_point: parseInt(killPoints.trim() == ''?0:killPoints.trim()),
        t1_kill: parseInt(t1Kill.trim()),
        t2_kill: parseInt(t2Kill.trim()),
        t3_kill: parseInt(t3Kill.trim()),
        t4_kill: parseInt(t4Kill.trim()),
        t5_kill: parseInt(t5Kill.trim()),
        dead:parseInt(dead.trim()),
        resource_assistance: parseInt(resourceAssistance.trim()),
        resource_gathered: parseInt(resourceGathered.trim()),
        alliance_help: parseInt(helpTimes.trim()),
        created_at:curDate,
        updated_at:curDate
    };
    return governor;
}
