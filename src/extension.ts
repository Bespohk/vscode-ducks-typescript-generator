import * as vscode from 'vscode';

import { generateDuck } from "./generate";
import { initializeDucks } from "./initialize";

export function activate(context: vscode.ExtensionContext) {
  const generateDuckCommand = vscode.commands.registerCommand('extension.generateDuck', () => {
    generateDuck();
  });
  const initializeDucksCommand = vscode.commands.registerCommand('extension.initializeDuck', () => {
    initializeDucks();
  });

  context.subscriptions.push(generateDuckCommand, initializeDucksCommand);
}

export function deactivate() { }
