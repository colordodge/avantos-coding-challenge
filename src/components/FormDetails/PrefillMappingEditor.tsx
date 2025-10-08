import { useSelector } from 'react-redux'
import { selectBlueprintData, selectSelectedNode } from '../../store/slices/blueprintSlice'
import styles from './PrefillMappingEditor.module.css'
import type { Edge } from '../../store/types'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box } from '@mui/material';

function getAncestorIds(nodeId: string, edges: Edge[]): string[] {
    // Find ALL edges that point to this node (not just the first one)
    const parentEdges = edges.filter(edge => edge.target === nodeId)
    const parentNodeIds = parentEdges.map(edge => edge.source)
    
    if (parentNodeIds.length === 0) {
        return []
    }
    
    // Recursively get ancestors for each parent and flatten the results
    const allAncestors = parentNodeIds.flatMap(parentId => 
        [parentId, ...getAncestorIds(parentId, edges)]
    )
    
    return allAncestors
}

export function PrefillMappingEditor() {

    // get a grouping of all the possible prefill mappings via the DAG
    const selectedNode = useSelector(selectSelectedNode)
    const blueprintData = useSelector(selectBlueprintData)

    const forms = blueprintData?.forms || []
    const edges = blueprintData?.edges || []
    const nodes = blueprintData?.nodes || []

    // get a list of all the nodes that are above the selected node
    var ancestorIds = getAncestorIds(selectedNode?.id || '', edges)
    // remove duplicates from ancestorIds
    ancestorIds = [...new Set(ancestorIds)]
    const ancestorNodes = nodes.filter(node => ancestorIds.includes(node.id))

    const treeItems = ancestorNodes.map(node => {

        if (!node) {
            return null
        }

        const form = forms.find(form => form.id === node.data.component_id)
        if (!form) {
            return null
        }
        
       const propertyKeys = Object.keys(form.field_schema.properties)
       const childItems = propertyKeys.map(key => {
            const id = `${node.id}-${key}`
            return <TreeItem key={id} itemId={id} label={key} />
        })

       return (
        <TreeItem key={node.id} itemId={node.id} label={node.data.name}>
            {childItems}
        </TreeItem>
       )

    })


    return (
        <div className={styles.prefillMappingEditor}>
            <h1>Prefill Mapping Editor</h1>
            <Box sx={{ minHeight: 352, minWidth: 250 }}>
                <SimpleTreeView>
                    { treeItems }
                </SimpleTreeView>
                
            </Box>
        </div>
    )
}