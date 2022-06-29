#!/usr/bin/env node

import fetch from "node-fetch";
import chalk from "chalk";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";

import yargs from "yargs";
const y = yargs(process.argv.slice(2)).argv;

const API_URL = "https://tdk-db.herokuapp.com/tdk?word=";

/**
 * It takes an input from the user, then it searches the input in the TDK dictionary and returns the
 * result
 * @returns The result of the getWord function.
 */
async function searchInTDK() {
  console.log(`\n${chalk.bgBlue(" 📖 TDK Sözlük ")}\n`);

  let input = y._[0];

  while (input === undefined || input.trim() === "") {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "input",
        message: "Lütfen bir kelime giriniz:",
      },
    ]);
    input = answers.input;
  }

  const spinner = createSpinner(`"${input}" aranıyor...`).start();

  getWord(input).then((res) => {
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

function main() {
  console.clear();
  searchInTDK();
}

main();
