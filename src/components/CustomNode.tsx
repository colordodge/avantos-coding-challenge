import { Handle, Position } from '@xyflow/react'
import styles from './CustomNode.module.css'
import ArticleIcon from '@mui/icons-material/Article';

export function CustomNode({ data }: { data: { label: string; hasSourceConnection: boolean; hasTargetConnection: boolean } }) {
    return (
        <>
            <Handle 
                type="target" 
                position={Position.Left}
                style={{ opacity: data.hasSourceConnection ? 1 : 0 }}
            />
            <div className={styles.customNode}>
                <ArticleIcon className={styles.nodeIcon} />
                {data.label}
                </div>
            <Handle 
                type="source" 
                position={Position.Right}
                style={{ opacity: data.hasTargetConnection ? 1 : 0 }}
            />
        </>
    );
}