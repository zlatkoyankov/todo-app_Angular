export interface Priority {
    value: PriorityLabel;
    label: string;
    color: string;
}

export enum PriorityLabel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High'
}
