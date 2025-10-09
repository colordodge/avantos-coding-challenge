

export interface BlueprintData {
    $schema: string
    id: string
    tenant_id: string
    name: string
    description: string
    category: string
    nodes: Node[]
    edges: Edge[]
    forms: Form[]
    branches: any[]
    triggers: any[]
}

/// Node

export interface Node {
    id: string;
    type: string;
    position: Position;
    data: FormData;
}

export interface Position {
    x: number
    y: number
}

export interface FormData {
    id: string
    component_key: string
    component_type: string
    component_id: string
    name: string
    prerequisites: string[]
    permitted_roles: string[]
    input_mapping: Record<string, any>
    sla_duration: {
        number: number
        unit: string
    };
    approval_required: boolean
    approval_roles: string[]
}


/// Edge

export interface Edge {
    source: string
    target: string
}

/// Form

export interface Form {
    id: string
    name: string
    is_reusable: boolean,
    field_schema: FieldSchema
    ui_schema: UISchema
    dynamic_field_config: DynamicFieldConfig
}

export interface FieldSchema {
    type: string
    properties: Record<string, any>
    required: string[]
}

export interface UISchema {
    type: string
    elements: Array<{
        type: string
        scope: string
        label: string
        options?: Record<string, any>
    }>
}

export interface DynamicFieldConfig {
    [key: string]: {
        selector_field: string
        payload_fields: Record<string, {
            type: string
            value: string
        }>
        endpoint_id: string
    }
}






