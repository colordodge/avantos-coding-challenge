import { selectBlueprintNodes, selectBlueprintEdges, fetchBlueprintData } from '../store/slices/blueprintSlice'
import { useDispatch, useSelector } from 'react-redux'
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './BlueprintGraph.module.css'
import { useEffect } from 'react';
import type { AppDispatch } from '../store';
import { CustomNode } from './CustomNode';

const nodeTypes = {
    custom: CustomNode,
}

export function BlueprintGraph() {

    const dispatch = useDispatch<AppDispatch>()
    const nodes = useSelector(selectBlueprintNodes)
    const edges = useSelector(selectBlueprintEdges)

    useEffect(() => {
        dispatch(fetchBlueprintData())
    }, [dispatch])

    
    return (
        <div className={styles.blueprintGraph}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
            />
        </div>
    )

}