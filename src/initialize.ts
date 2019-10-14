import * as vscode from "vscode";

import { IS_WORKSPACE, workspaceError } from "./utils";

const initializeDucks = () => {
  if (!IS_WORKSPACE) {
    return workspaceError();
  }
  const window = vscode.window;
  window.showInputBox({ prompt: "What is the name of your duck?" }).then(value => window.showInformationMessage(value as any));
};

export {
  initializeDucks
};

