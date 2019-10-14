import * as fs from "fs";
import * as vscode from "vscode";

import { IS_WORKSPACE, camelCase, ducksRoot, workspaceError, workspaceRoot } from "./utils";

const window = vscode.window;

const requestDucksName = async (): Promise<any> => {
  return await window.showInputBox({ prompt: "What is the name of your duck?" }).then(name => {
    return Promise.resolve(name);
  });
};

const getDucksRootPath = async (): Promise<any> => {
  const workspaceRootPath: string | null = workspaceRoot();
  if (!workspaceRootPath) {
    window.showInputBox({ prompt: `What is the path to your ducks folder? Relative to ${workspaceRootPath}` }).then(path => {
      return Promise.resolve(`${workspaceRootPath}/${path}`);
    });
  } else {
    return Promise.resolve(ducksRoot());
  }
};

const requestTypes = async (): Promise<any> => {
  return await window.showInputBox({ prompt: "What are the types you'd like to include in this duck? (Comma separated)", placeHolder: "CREATE, CREATE_SUCCESS" }).then(types => {
    if (!types) {
      return Promise.reject();
    }
    return Promise.resolve(types.split(",").map(type => type.trim()));
  });
};

const Generators: any = {
  index: (): string => {
    return `import * as actions from "./actions";
import * as operations from "./operations";
import * as selectors from "./selectors";
import * as types from "./types";

import reducer from "./reducers";

export {
  operations,
  actions,
  types,
  selectors
};

export default reducer;
`;
  },
  actions: (duck: string, types: string[]): string => {
    if (types.length) {
      const actionNames: string[] = types.map(name => camelCase(name));
      const actionMethods: string[] = types.map(type => `const ${camelCase(type)} = (): any => {
  return {
    type: Types.${type}
  };
}`);
      return `import Types from "./types";

// Modify the return types for each action
${actionMethods.join("\n\n")}

export {
  ${actionNames.join(",\n  ")}
};
`;
    }
    return "";
  },
  operations: (_: string, types: string[]): string => {
    let dispatchLine: string = "// dispatch(actionFromImportAbove);"
    if (types.length) {
      dispatchLine = `dispatch(${camelCase(types[0])}());`;
    }
    return `import { ${types.map(type => camelCase(type)).join(", ")} } from "./actions";

import { Dispatch } from "redux";

const operation = (): any => {
  return (dispatch: Dispatch<any>): any => {
    ${dispatchLine}
  }
};

type Operations = {
  operation: () => void
};

const operations: Operations = {
  operation
};

export {
  operation,
  operations,
  Operations
};
`;
  },
  reducers: (_: string, types: string[]): string => {
    if (types.length) {
      return `import Types from "./types";

// TODO: Modify the type for the initial state
const initialState: any = null;

// TODO: Modify the action to match what is coming back from ./actions.ts
const reducer = (state = initialState, action: any): any => {
  let { type } = action;
  let newState: any = state;
  switch (type) {
${types.map(type => `    case Types.${type}:
      break;
`).join("\n")}
    default:
      break;
  }
  return newState;
};

export {
  reducer
};

export default reducer;
`;
    }
    return "";
  },
  selectors: (): string => {
    return `const selector = (objects: any): any => {
  return objects;
};

export {
  selector
};
`;
  },
  types: async (duck: string, types: string[]): Promise<string> => {
    if (types.length) {
      let actualTypes = types.map(type => {
        let cleanType: string = type.toUpperCase().replace(" ", "_");
        return `${cleanType}: "@@${duck}/${cleanType}"`;
      });
      return `const Types = {
  ${actualTypes.join(`,\n  `)}
};

export {
  Types
};

export default Types;
`;
    }
    return "";
  },
  reducersTest: async (duck: string, types: string[]): Promise<string> => {
    return `import { reducer } from "./reducers";
import Types from "./types";

describe("testing the ${duck} reducer", () => {
  describe("testing specific action case", () => {
    const action: any = {
      type: ${types.length ? `Types.${types[0]}` : "null"}
    };

    it("passes the test", () => {
      const currentState: any = {};
      const newState: any = reducer(currentState, action);
      expect(newState).toEqual(currentState);
    });
  });
});
`
  }
}


const generateDuck = async () => {
  if (!IS_WORKSPACE) {
    return workspaceError();
  }
  const actualDucksRoot: string = await getDucksRootPath();
  if (!actualDucksRoot) {
    vscode.window.showErrorMessage("You must have a `ducks/` folder in your project.");
    return;
  }
  const ducksName: string = await requestDucksName();
  const fullPath: string = `${actualDucksRoot}/${ducksName}`;
  if (!ducksName) {
    return;
  }

  fs.mkdir(fullPath, { recursive: true }, (e) => { window.showErrorMessage(e as any); });
  const files: string[] = ["actions", "index", "operations", "reducers", "selectors", "types", "reducers.test"];
  let types: string[] = await requestTypes();
  if (!types) {
    types = [];
  }
  files.forEach(async (file) => {
    let filePath: string = `${fullPath}/${file}.ts`;
    let content: any = await Generators[camelCase(file)](ducksName, types);
    fs.writeFile(filePath, content, { encoding: "utf8", flag: "w" }, () => { })
  });
};

export {
  generateDuck
};
