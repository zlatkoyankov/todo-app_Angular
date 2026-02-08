export interface Priority {
    value: PriorityLabel;
    label: string;
    coloer: string;
}

export enum PriorityLabel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High'
}
