import chalk from "chalk";
import { loadResourceFiles } from "../util/files"
import { planMigrations } from "../main/planner"
const plan = async () => {
    try {
        const resources = await loadResourceFiles()
        console.log('------------- planned (todo, prettyprint in separate function): -------------')
        const planned = await planMigrations(resources)
        console.log(planned)
    } catch (error) {
        console.log(error)
        console.error(chalk.red(`${chalk.bold("Error")}: ${error.message}`));
    }
};

export default plan;
