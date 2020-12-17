import { Builder, By, WebElement, Key, ThenableWebDriver, until, error } from "selenium-webdriver";
import readline from "readline";
const chrome = require("selenium-webdriver/chrome");
import GoogleSearch from "./components/google.json";
import logger from "./utils/logger";
const { promisify } = require("util");

const rl = readline.createInterface(process.stdin, process.stdout);

/**
 * Input command line.
 *
 * @param {string} prompt.
 * @param {callback}{string} handler.
 */
function promptInput(prompt: any, handler: any) {
  rl.question(prompt, (input: string) => {
    if (handler(input) !== false) {
      promptInput(prompt, handler);
    } else {
      rl.close();
    }
  });
}

/* Using npm chromedriver */
// import chromedriver from "chromedriver";
// chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());

/* Using chromedriver local */
if (process.env.SELENIUM_REMOTE_URL === undefined) {
  chrome.setDefaultService(new chrome.ServiceBuilder("/usr/local/bin/chromedriver").build());
}

let driver: ThenableWebDriver;
function init_driver() {
  return new Promise(async (resolve) => {
    /* Sample options:
      .forBrowser('firefox')
      .setChromeOptions(new chrome.Options().headless().windowSize(screen))
      .setChromeOptions(new chrome.Options().addArguments('--headless'))
      .setChromeOptions(new chrome.Options().addArguments('--disable-notifications'))
      .setFirefoxOptions(new firefox.Options().headless().windowSize(screen))
      .setChromeOptions(new chrome.Options().addArguments("--disable-gpu"))
      .setChromeOptions(new chrome.Options().addArguments("--no-sandbox"))
      .setChromeOptions(new chrome.Options().addArguments("--disable-dev-shm-usage"))

      driver = new Builder()
      .forBrowser("chrome")
      .setChromeOptions(new chrome.Options().addArguments("--headless"))
      .build();
    */

    let options = new chrome.Options();
    if (process.env.SELENIUM_REMOTE_URL === undefined) {
      options.addArguments("--headless");
    }
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");

    driver = new Builder().forBrowser("chrome").setChromeOptions(options).build();
    resolve("");
  });
}

async function main() {
  if (process.env.SELENIUM_REMOTE_URL !== undefined) {
    logger.info("Remote mode");
  } else {
    logger.info("Browser mode");
  }

  await init_driver();
  await driver.manage().window().setRect({ width: 1024, height: 768, x: 0, y: 0 });
  try {
    await driver.get(GoogleSearch.MainUrl);
  } catch (e) {
    console.log("[ERROR]", e);
    logger.error("[ERROR]", e);
  }

  promptInput("Command > ", async (inputstr: string) => {
    const input = inputstr.split(" ");
    const command = input[0];
    const arg = inputstr.slice(command.length + 1);
    if (command !== "") {
      switch (command) {
        case "start":
          await init_driver();
          await driver.manage().window().setRect({ width: 1024, height: 768, x: 0, y: 0 });
          try {
            await driver.get(GoogleSearch.MainUrl);
          } catch (e) {
            console.log("[ERROR]", e);
            logger.error("[ERROR]", e);
          }
          break;
        case "loadpage":
          await driver.manage().window().setRect({ width: 1024, height: 768, x: 0, y: 0 });
          try {
            await driver.get(GoogleSearch.MainUrl);
          } catch (e) {
            console.log("[ERROR]", e);
            logger.error("[ERROR]", e);
          }
          break;

        case "search":
          let GoogleSearchElement: WebElement;
          let ObjectText: string = "";
          let SnippetInfoText: string = "";
          GoogleSearchElement = await driver.findElement(By.name("q"));
          GoogleSearchElement.clear();
          GoogleSearchElement.sendKeys(arg, Key.RETURN);

          /* Check Search List */
          await driver.wait(until.elementLocated(By.xpath(GoogleSearch.SearchList)), 10000);
          GoogleSearchElement = driver.switchTo().activeElement();

          /* Check Object */
          let Object = await GoogleSearchElement.findElements(By.xpath(GoogleSearch.Object));
          if (Object.length != 0) {
            let checkObjectInfo: boolean = true;
            try {
              let ObjectInfo = await Object[0].findElement(By.xpath(GoogleSearch.ObjectInfo1));
              ObjectText = await ObjectInfo.getText();
            } catch (e) {
              checkObjectInfo = false;
            }

            if (checkObjectInfo === false) {
              checkObjectInfo = true;
              try {
                let ObjectInfo = await Object[0].findElement(By.xpath(GoogleSearch.ObjectInfo2));
                ObjectText = await ObjectInfo.getText();
              } catch (e) {
                checkObjectInfo = false;
              }
            }
          }

          /* Check Snippet */
          let FirstResult = await GoogleSearchElement.findElement(
            By.xpath(GoogleSearch.FirstResult),
          );
          try {
            const checkBorder = (await FirstResult.getCssValue("border")).split(" ")[1];
            let SnippetInfo;
            if (checkBorder !== "none") {
              let SnippetList = await FirstResult.findElements(By.xpath("div"));
              if (SnippetList.length === 1) {
                SnippetInfo = await FirstResult.findElement(By.xpath(GoogleSearch.SnippetInfo1));
              } else {
                SnippetInfo = await FirstResult.findElement(By.xpath(GoogleSearch.SnippetInfo2));
              }
              SnippetInfoText = await SnippetInfo.getText();
            } else {
              let SearchList = await GoogleSearchElement.findElements(
                By.xpath(GoogleSearch.SearchList + "/div"),
              );
              if (SearchList.length == 2) {
                SnippetInfo = await FirstResult.findElement(By.xpath(GoogleSearch.SnippetInfo3));
              }
            }
          } catch (e) {
            console.log("Xin lỗi, mình chưa hiểu ý bạn");
          }

          if (SnippetInfoText !== "") {
            console.log(SnippetInfoText);
          }

          if (ObjectText !== "") {
            console.log(ObjectText);
          }

          if (SnippetInfoText === "" && ObjectText === "") {
            console.log("Xin lỗi, mình chưa hiểu ý bạn");
          }

          break;

        case "stop":
          driver.quit();
          break;
      }
    }
  });
}

main();
