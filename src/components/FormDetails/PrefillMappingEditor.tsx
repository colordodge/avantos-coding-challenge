import { useSelector } from 'react-redux'
import { selectBlueprintData, selectSelectedNode } from '../../store/slices/blueprintSlice'
import styles from './PrefillMappingEditor.module.css'
import type { Edge, Node } from '../../store/types'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box } from '@mui/material';

function getAncestorIds(nodeId: string, edges: Edge[]): string[] {
    const parentNodeId = edges.find(edge => edge.target === nodeId)?.source
    if (parentNodeId) {
        return [parentNodeId, ...getAncestorIds(parentNodeId, edges)]
    }
    return []
}

export function PrefillMappingEditor() {

    // get a grouping of all the possible prefill mappings via the DAG
    const selectedNode = useSelector(selectSelectedNode)
    const blueprintData = useSelector(selectBlueprintData)

    const forms = blueprintData?.forms || []
    const edges = blueprintData?.edges || []
    const nodes = blueprintData?.nodes || []

    // get a list of all the nodes that are above the selected node
    const ancestorIds = getAncestorIds(selectedNode?.id || '', edges)
    const ancestorNodes = nodes.filter(node => ancestorIds.includes(node.id))
    const ancestorForms = ancestorNodes.map( node => forms.find(form => form.id === node.data.component_id))

    console.log(ancestorForms)

    const treeItems = ancestorForms.map(form => {

        if (!form) {
            return null
        }
        
       const propertyKeys = Object.keys(form.field_schema.properties)
       const childItems = propertyKeys.map(key => (
        <TreeItem key={key} itemId={key} label={key} />
       ))

       return (
        <TreeItem key={form.id} itemId={form.id} label={form.name}>
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