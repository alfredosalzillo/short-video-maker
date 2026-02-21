import { ensureBrowser } from "@remotion/renderer";
import { Config } from "../config";
import { logger } from "../logger";
import { Kokoro } from "../server/short-creator/libraries/Kokoro";
import { Whisper } from "../server/short-creator/libraries/Whisper";
import { MusicManager } from "../server/short-creator/music";

// runs in docker
export async function install() {
  const config = new Config();

  logger.info("Installing dependencies...");
  logger.info("Installing Kokoro...");
  await Kokoro.init(config.kokoroModelPrecision);
  logger.info("Installing browser shell...");
  await ensureBrowser();
  logger.info("Installing whisper.cpp");
  await Whisper.init(config);
  logger.info("Installing dependencies complete");

  logger.info("Ensuring the music files exist...");
  const musicManager = new MusicManager(config);
  try {
    musicManager.ensureMusicFilesExist();
  } catch (error: unknown) {
    logger.error(error, "Missing music files");
    process.exit(1);
  }
}

install()
  .then(() => {
    logger.info("Installation complete");
  })
  .catch((error: unknown) => {
    logger.error(error, "Installation failed");
  });
