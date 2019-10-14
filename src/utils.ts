import * as FastGlob from "fast-glob";
import * as vscode from "vscode";

import { Uri, WorkspaceFolder } from "vscode";

const workspaceRoot = (): string | null => {
  const workspaceFolders: WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return null;
  }
  const folder: WorkspaceFolder = workspaceFolders[0];
  const uri: Uri = folder.uri;

  return uri.fsPath;
}

const workspaceError = () => {
  vscode.window.showErrorMessage("You must be working from an existing project.");
}

const camelCase = (str: string): string => {
  return str.toLowerCase().replace(".", "_").split("_").reduce((p, c) => p + (!p ? c[0] : c[0].toUpperCase()) + c.slice(1), "");
}

const ducksRoot = (): string => {
  let path = `${workspaceRoot()}/**/ducks`;
  let root: string[] = FastGlob.sync([path], { onlyDirectories: true });
  return root[0];
}

const IS_WORKSPACE = !!workspaceRoot();

export {
  IS_WORKSPACE,
  workspaceError,
  workspaceRoot,
  ducksRoot,
  camelCase
};
