"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var path = require("path");
var task = require("vsts-task-lib/task");
var FLUTTER_TOOL_PATH_ENV_VAR = 'FlutterToolPath';
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var flutterPath, projectDirectory, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    flutterPath = task.getVariable(FLUTTER_TOOL_PATH_ENV_VAR) || process.env[FLUTTER_TOOL_PATH_ENV_VAR];
                    flutterPath = path.join(flutterPath, "flutter");
                    if (!flutterPath) {
                        throw new Error("The '" + FLUTTER_TOOL_PATH_ENV_VAR + "' environment variable must be set before using this task (you can use 'flutterinstall' task).");
                    }
                    projectDirectory = task.getPathInput('projectDirectory', false, false);
                    if (projectDirectory) {
                        task.debug("Moving to " + projectDirectory);
                        task.cd(projectDirectory);
                    }
                    return [4 /*yield*/, runAnalysis(flutterPath)];
                case 1:
                    results = _a.sent();
                    if (results.isSuccess) {
                        task.setResult(task.TaskResult.Succeeded, "All tests passed");
                    }
                    else {
                        task.setResult(task.TaskResult.Failed, "Some tests failed");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function runAnalysis(flutter) {
    return __awaiter(this, void 0, void 0, function () {
        var testRunner, currentSuite, results, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    testRunner = task.tool(flutter);
                    testRunner.arg(['analyze', '--pub']);
                    currentSuite = null;
                    results = {
                        isSuccess: false,
                        suites: []
                    };
                    testRunner.on('stdout', function (line) {
                        var testSuiteRegex = /   (.*) • (.*) • (.*)\.dart:[0-9]+:[0-9]+ • (.*)/;
                        var loadingMatch = testSuiteRegex.exec(line);
                        if (loadingMatch) {
                            var newSuite = {
                                title: path.basename(loadingMatch[3], ".dart"),
                                isSuccess: false,
                                succeeded: 0,
                                failed: 0,
                                cases: []
                            };
                            if (!currentSuite || newSuite.title !== currentSuite.title) {
                                currentSuite = newSuite;
                                results.suites.push(newSuite);
                            }
                        }
                    });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, testRunner.exec()];
                case 2:
                    _b.sent();
                    results.isSuccess = true;
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, results];
            }
        });
    });
}
main()["catch"](function (error) {
    task.setResult(task.TaskResult.Failed, error);
});
