export declare type TagValue = Tags['If'] | Tags['Ref'] | Tags['Select'] | Tags['Split'] | Tags['Sub'] | string | boolean;
export declare type TagCondition = Tags['Equals'] | Tags['DeepEquals'] | Tags['And'] | Tags['Or'] | Tags['Not'] | Tags['Empty'] | Tags['Regex'] | boolean;
export declare type TagSequence = Tags['Split'] | Scalar[];
export declare type Tags = {
    If: {
        If: [TagCondition, TagValue, TagValue];
    };
    Ref: {
        Ref: string;
    };
    Select: {
        Select: [number, TagValue[]];
    };
    Split: {
        Split: [TagValue, TagValue];
    };
    Sub: {
        Sub: TagValue | [TagValue, Record<string, TagValue>];
    };
    Equals: {
        Equals: [TagValue, TagValue];
    };
    Regex: {
        Regex: [TagValue, TagValue];
    };
    DeepEquals: {
        DeepEquals: [TagValue, TagValue];
    };
    And: {
        And: TagCondition[];
    };
    Or: {
        Or: TagCondition[];
    };
    Not: {
        Not: [TagCondition];
    };
    Empty: {
        Empty: [TagValue];
    };
    None: {
        None: string;
    };
};
export interface CommandOptions {
    desc?: string;
    descargs?: string;
    cwd?: string;
    name?: string;
    env?: Record<string, TagValue>;
    variables?: Record<string, TagValue>;
}
export declare type FileCommand = string | FileCommands;
export interface Command2 extends Record<string, Commands2> {
}
export declare type FileCommands = {
    [key: string]: FileCommand;
};
export declare type Commands2 = {
    [key: string]: string;
};
export declare type Task = TaskSerie | TaskParallel | TaskExec | string;
export declare type TaskExec = {
    Exec: Task | string;
    Options: CommandOptions;
};
export declare type TaskSerie = {
    Serie: Task[];
    Options: CommandOptions;
};
export declare type TaskParallel = {
    Parallel: Task[];
    Options: CommandOptions;
};
export declare type WKConfig = {
    commands: string;
    verbose: boolean;
    debug: boolean;
    nocolor: boolean;
};
export declare type WKOptions = WKConfig & {
    command: string;
    argv: string[];
};
export declare type DStringBool = Record<string, string | boolean>;
export declare type DScalar = Record<string, string | boolean | number>;
export declare type Scalar = string | boolean;
