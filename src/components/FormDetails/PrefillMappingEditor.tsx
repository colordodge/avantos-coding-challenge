import { useDispatch, useSelector } from 'react-redux'
import { selectSelectedNode } from '../../store/slices/blueprintSlice'
import styles from './PrefillMappingEditor.module.css'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import type { AppDispatch } from '../../store';
import { addPrefillMapping, selectPrefillMappings, selectAvailableDataSourceMappings } from '../../store/slices/prefillMappingSlice';


function generateLeafId(parentId: string, fieldKey: string) {
    return `${parentId}:${fieldKey}`
}

export function PrefillMappingEditor({ selectedFieldKey, onCancel }: { selectedFieldKey: string, onCancel: () => void }) {

    const dispatch = useDispatch<AppDispatch>()

    // get available data sources for prefill via the DAG
    const selectedNode = useSelector(selectSelectedNode)
    const availableSources = useSelector(selectAvailableDataSourceMappings)
    const prefillMappings = useSelector(selectPrefillMappings)

    // Compute initial state with a lazy initializer function
    const [selectedTreeItem, setSelectedTreeItem] = useState<string | null>(() => {
        if (!selectedNode) return null 
    
        // Find existing mapping for this node and field
        const existingMapping = prefillMappings.find(
            mapping => mapping.targetNodeId === selectedNode.id && mapping.targetFieldKey === selectedFieldKey
        )
    
        if (existingMapping) {
            return generateLeafId(existingMapping.source.id, existingMapping.source.fieldKey)
        }
        return null 
    })

    // Add state for expanded items - initialize with parent of selected item
    const [expandedItems, setExpandedItems] = useState<string[]>(() => {
        return selectedTreeItem ? [selectedTreeItem.split(':')[0]] : []
    })
    
    const formName = selectedNode?.data.name ?? 'Form'
    const fieldKey = selectedFieldKey

    // Build a quick map from leafId to DataSource
    const leafIdToSource = new Map<string, { id: string, name: string, fieldKey: string, type: 'form_field' | 'global' }>()

    // Group sources by their parent id so we can render tree groups
    const parentIdToGroup = new Map<string, { name: string, fieldKeys: string[] }>()
    availableSources.forEach((src) => {
        const group = parentIdToGroup.get(src.id)
        if (!group) {
            parentIdToGroup.set(src.id, { name: src.name, fieldKeys: [src.fieldKey] })
        } else {
            group.fieldKeys.push(src.fieldKey)
        }
        const leafId = generateLeafId(src.id, src.fieldKey)
        leafIdToSource.set(leafId, src)
    })

    const treeItems = Array.from(parentIdToGroup.entries()).map(([parentId, group]) => {
        const childItems = group.fieldKeys.map((key) => {
            const id = generateLeafId(parentId, key)
            return <TreeItem key={id} itemId={id} label={key} />
        })
        return (
            <TreeItem key={parentId} itemId={parentId} label={group.name}>
                {childItems}
            </TreeItem>
        )
    })

    // get leaf ids so we can check that a leaf has been selected
    const leafIds = new Set<string>(Array.from(leafIdToSource.keys()))

    const savePrefillMapping = () => {
        if (!selectedTreeItem || !selectedNode) { return }

        const selectedSource = leafIdToSource.get(selectedTreeItem)
        if (!selectedSource) { return }

        dispatch(addPrefillMapping({
            source: selectedSource,
            targetNodeId: selectedNode.id,
            targetFieldKey: selectedFieldKey
        }))

        onCancel()
    }

    // it might be better to use a different method to get the target name
    // tree view selection only gives us the leaf id, not the option group id
    const selectedSourceForName = selectedTreeItem ? leafIdToSource.get(selectedTreeItem) : undefined
    const sourceName = selectedSourceForName ? `${selectedSourceForName.name}.${selectedSourceForName.fieldKey}` : '?'

    return (
        <div className={styles.prefillMappingEditor}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>Select a Prefill Mapping</h1>
                    <div className={styles.mappingPreview}>{formName}.{fieldKey} : {sourceName} </div>
                </div>
                
                <Box className={styles.treeContainer}>
                    <SimpleTreeView 
                    selectedItems={selectedTreeItem}
                    expandedItems={expandedItems}
                    onExpandedItemsChange={(_event, itemIds) => {
                        setExpandedItems(itemIds)
                    }}
                    onSelectedItemsChange={(_event, itemId) => {
                        if (typeof itemId === 'string') {
                            if (leafIds.has(itemId)) {
                                setSelectedTreeItem(itemId)
                            } else {
                                setSelectedTreeItem(null)
                            }
                        }
                    }}>
                        { treeItems }
                    </SimpleTreeView>
                    
                </Box>
            </div>

            <div className={styles.actionMenu}>
                <Button variant="outlined" color="primary" onClick={onCancel}>Cancel</Button>
                <Button variant="contained" color="primary" disabled={!selectedTreeItem} onClick={savePrefillMapping}>Save</Button>
            </div>
        </div>
    )
}