export declare type TagValue = Tags['If'] | Tags['Ref'] | Tags['Select'] | Tags['Split'] | Tags['Sub'] | string | boolean;
export declare type TagCondition = Tags['Equals'] | Tags['DeepEquals'] | Tags['And'] | Tags['Or'] | Tags['Not'] | Tags['Empty'] | boolean;
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
        Not: TagCondition;
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
    parallel?: boolean;
    name?: string;
    env?: Record<string, TagValue>;
}
export declare type Commands = {
    [key: string]: string[];
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
export declare type WKOptions = {
    commands: string;
    verbose: boolean;
    debug: boolean;
};
export declare type Scalar = string | boolean;
