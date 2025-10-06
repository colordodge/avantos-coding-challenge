import { Handle, Position } from '@xyflow/react'
import styles from './CustomNode.module.css'

export function CustomNode({ data }: { data: { label: string; hasSourceConnection: boolean; hasTargetConnection: boolean } }) {
    return (
        <>
            <Handle 
                type="target" 
                position={Position.Left}
                style={{ opacity: data.hasSourceConnection ? 1 : 0 }}
            />
            <div className={styles.customNode}>{data.label}</div>
            <Handle 
                type="source" 
                position={Position.Right}
                style={{ opacity: data.hasTargetConnection ? 1 : 0 }}
            />
        </>
    );
}