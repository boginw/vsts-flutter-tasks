import * as path from "path";
import * as task from "vsts-task-lib/task";

const FLUTTER_TOOL_PATH_ENV_VAR: string = 'FlutterToolPath';

async function main(): Promise<void> {
    // 1. Check flutter environment
    var flutterPath = task.getVariable(FLUTTER_TOOL_PATH_ENV_VAR) || process.env[FLUTTER_TOOL_PATH_ENV_VAR];
    flutterPath = path.join(flutterPath, "flutter")
    if (!flutterPath) {
        throw new Error(`The '${FLUTTER_TOOL_PATH_ENV_VAR}' environment variable must be set before using this task (you can use 'flutterinstall' task).`);
    }

    // 3. Move current working directory to project
    let projectDirectory = task.getPathInput('projectDirectory', false, false);
    if (projectDirectory) {
        task.debug(`Moving to ${projectDirectory}`);
        task.cd(projectDirectory);
    }

    // 5. Running tests
    var results = await runAnalysis(flutterPath);

    if(results.isSuccess) {
        task.setResult(task.TaskResult.Succeeded, `All tests passed`);
    }
    else {
        task.setResult(task.TaskResult.Failed, `Some tests failed`);
    }
}

async function runAnalysis(flutter: string) {
    let testRunner = task.tool(flutter);
    testRunner.arg(['analyze', '--pub']);

    var currentSuite : any = null;
    var results = {
        isSuccess: false,
        suites: []
    };

    testRunner.on('stdout', line => {
        const testSuiteRegex = /   (.*) • (.*) • (.*)\.dart:[0-9]+:[0-9]+ • (.*)/;
        let loadingMatch = testSuiteRegex.exec(line);
        if(loadingMatch) {
            var newSuite = {
                title: path.basename(loadingMatch[3], ".dart"),
                isSuccess: false,
                succeeded: 0,
                failed: 0,
                cases: []
            }
            
            if(!currentSuite || newSuite.title !== currentSuite.title) {
                currentSuite = newSuite;
                results.suites.push(newSuite);
            }
        }
    });

    try {
        await testRunner.exec();
        results.isSuccess = true;
    }
    catch {}

    return results;
}


main().catch(error => {
    task.setResult(task.TaskResult.Failed, error);
});