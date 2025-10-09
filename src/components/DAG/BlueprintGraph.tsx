import { selectBlueprintNodes, selectBlueprintEdges, fetchBlueprintData, selectBlueprintData, setSelectedNode, selectSelectedNode } from '../../store/slices/blueprintSlice'
import { useDispatch, useSelector } from 'react-redux'
import { ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import styles from './BlueprintGraph.module.css'
import { useCallback, useEffect } from 'react'
import type { AppDispatch } from '../../store'
import { CustomNode } from './CustomNode'
import { Modal } from '@mui/material'
import { FormDetails } from '../FormDetails/FormDetails'
import { motion, AnimatePresence } from 'framer-motion'

const nodeTypes = {
    custom: CustomNode,
}

export function BlueprintGraph() {

    const dispatch = useDispatch<AppDispatch>()
    const nodes = useSelector(selectBlueprintNodes)
    const edges = useSelector(selectBlueprintEdges)
    const blueprintData = useSelector(selectBlueprintData)
    const selectedNode = useSelector(selectSelectedNode)

    const handleNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
        // find the original node from the  blueprint data
        const originalNode = blueprintData?.nodes.find(n => n.id === node.id)
        if (originalNode){
            dispatch(setSelectedNode(originalNode))
        }
    }, [blueprintData, dispatch])

    const handlePaneClick = useCallback(() => {
        dispatch(setSelectedNode(null))
    }, [dispatch])

    const handleCloseModal = useCallback(() => {
        dispatch(setSelectedNode(null))
    }, [dispatch])
    

    useEffect(() => {
        dispatch(fetchBlueprintData())
    }, [dispatch])  

    
    return (
        <div className={styles.blueprintGraph}>
            <AnimatePresence>
                {selectedNode && (
                    <Modal 
                        open={true} 
                        onClose={() => dispatch(setSelectedNode(null))}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <motion.div
                            initial={{ y: '100vh' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100vh' }}
                            transition={{ 
                                duration: 0.3, 
                                ease: 'easeOut'
                            }}
                        >
                            <FormDetails onClose={handleCloseModal} />
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
                fitView
            />
        </div>
    )

}