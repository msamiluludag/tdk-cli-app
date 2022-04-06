#!/usr/bin/env node

// import node-fetch
import fetch from "node-fetch";
import chalk from "chalk";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";

const API_URL = "https://tdk-db.herokuapp.com/tdk?word=";

/**
 * Ask the user for a word to search for
 * @returns The word that the user entered.
 */

let word;

async function wordInput() {
  console.log(`\n${chalk.bgBlue(" 📖 TDK Sözlük ")}\n`);

  const answers = await inquirer.prompt({
    name: "word",
    type: "input",
    message: "Aramak istediğiniz kelimeyi giriniz.",
    default() {
      return "ör. kitap";
    },
  });

  word = answers.word;
}

/**
 * It searches the word in the dictionary and renders the result.
 */
async function searchWord() {
  const spinner = createSpinner("Aranıyor...").start();
  // await sleep(250);

  getWord(word).then((res) => {
    if (res.error) {
      spinner.error({ text: res.error });
      process.exit(1);
    } else {
      spinner.success({ text: "Arama tamamlandı.\n" });
      renderResult(res.result.data);
    }
  });
}

/**
 * It fetches a word from the API and returns the JSON data.
 * @param word - The word you want to look up.
 * @returns A promise.
 */
async function getWord(word) {
  try {
    const res = await fetch(API_URL + word);
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(chalk.red(err.message));
    process.exit(1);
  }
}

/**
 * It takes a list of words and prints out the meaning of each word
 * @param data - The data that is returned from the API.
 */
function renderResult(data) {
  for (const madde of data) {
    let result = "";
    result += `${chalk.bold.blue(madde.title)}`;
    result += "\n\n";

    if (madde.subtitle) {
      result += `${chalk.hex("#C792EA")(madde.subtitle)}`;
      result += "\n\n";
    }

    for (const meaning of madde.meanings) {
      const replacedMeaning = meaning.meaning.replace(":", ".");

      // id
      result += `${chalk.bold(meaning.id + ".")} `;

      // typeOrSuffix
      if (meaning.typeOrSuffix) {
        result += `${chalk.yellowBright(meaning.typeOrSuffix)} `;
      }

      // meaning
      result += `${replacedMeaning}\n`;

      // Example text

      // if (meaning.example.text) {
      //   result += `\t${chalk.blueBright("Ör.")} ${chalk.green(meaning.example.text)}\n`;
      // }

      // Example author

      // if (meaning.example.author) {
      //   result += `\t${chalk.yellow(meaning.example.author)}\n\n`;
      // }
    }

    console.log(result);
  }
}

/**
 * `sleep` is a function that takes a number of milliseconds as an argument and returns a promise that
 * resolves after that many milliseconds
 * @param ms - The number of milliseconds to wait.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.clear();
  await wordInput();
  await searchWord();
}

main();
