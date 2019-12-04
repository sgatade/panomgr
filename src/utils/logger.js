// Logger
const chalk = require("chalk");
const y = "[panomgr] ";

// d : Debug
const d = async (mesg) => {
    await console.log(chalk.blue(y + mesg));
};

// i : info
const i = async (mesg) => {
    await console.log(chalk.yellow(y + mesg));
};

// s : success
const s = async (mesg) => {
    await console.log(chalk.green(y + mesg));
}

// e : error
const e = async (mesg) => {
    await console.log(chalk.red(y + mesg));
}

module.exports = {d, i, s, e};