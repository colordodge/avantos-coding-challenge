import { Handle, Position } from '@xyflow/react'
import styles from './CustomNode.module.css'
import ArticleIcon from '@mui/icons-material/Article';
import { selectSelectedNode } from '../../store/slices/blueprintSlice';
import { useSelector } from 'react-redux';

export function CustomNode({ data }: { 
    data: { 
        id: string
        label: string
        hasSourceConnection: boolean
        hasTargetConnection: boolean 
    } }) {

    const selectedNode = useSelector(selectSelectedNode)
    const isSelected = selectedNode?.id === data.id

    return (
        <>
            <Handle 
                type="target" 
                position={Position.Left}
                style={{ opacity: data.hasSourceConnection ? 1 : 0 }}
            />
            <div className={`${styles.customNode} ${isSelected ? styles.selected : ''}`} >
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