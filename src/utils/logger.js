// Logger
const chalk = require("chalk");
const y = "[panomgr] ";

// d : Debug
const d = (mesg) => {
    console.log(chalk.blue(y + mesg));
};

// i : info
const i = (mesg) => {
    console.log(chalk.yellow(y + mesg));
};

// s : success
const s = (mesg) => {
    console.log(chalk.green(y + mesg));
}

// e : error
const e = (mesg) => {
    console.log(chalk.red(y + mesg));
}

module.exports = {d, i, s, e};