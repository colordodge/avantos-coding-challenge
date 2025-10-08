import { useSelector } from 'react-redux'
import { selectBlueprintData, selectPrefillOptionGroups, selectSelectedNode } from '../../store/slices/blueprintSlice'
import styles from './PrefillMappingEditor.module.css'
import type { Edge } from '../../store/types'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box, Button } from '@mui/material';
import { useMemo, useState } from 'react';
import { blue } from '@mui/material/colors';


function generateLeafId(nodeId: string, fieldKey: string) {
    return `${nodeId}:${fieldKey}`
}

export function PrefillMappingEditor({ selectedFieldKey, onCancel }: { selectedFieldKey: string, onCancel: () => void }) {

    const [selectedTreeItem, setSelectedTreeItem] = useState<string | null>(null)

    // get a grouping of all the possible prefill mappings via the DAG
    const selectedNode = useSelector(selectSelectedNode)
    const prefillOptionGroups = useSelector(selectPrefillOptionGroups)

    const formName = selectedNode?.data.name ?? 'Form'
    const fieldKey = selectedFieldKey


    const treeItems = prefillOptionGroups.map(optionGroup => {
        if (!optionGroup) {
            return null
        }
    
       const childItems = optionGroup.fieldKeys.map(key => {
            const id = generateLeafId(optionGroup.parentId, key)
            return <TreeItem key={id} itemId={id} label={key} />
        })

       return (
        <TreeItem key={optionGroup.parentId} itemId={optionGroup.parentId} label={optionGroup.parentName}>
            {childItems}
        </TreeItem>
       )

    })

    // get leaf ids so we can check that a leaf has been selected
    const leafIds = new Set<string>(
        prefillOptionGroups.flatMap(optionGroup => {
            if (!optionGroup) {
                return []
            }
            return optionGroup.fieldKeys.map(key => generateLeafId(optionGroup.parentId, key))
        })
    )

    // it might be better to use a different method to get the target name
    // tree view selection only gives us the leaf id, not the option group id
    const selectedOptionGroup = prefillOptionGroups.find(optionGroup => optionGroup?.parentId === selectedTreeItem?.split(':')[0])
    const targetName = selectedTreeItem ? `${selectedOptionGroup?.parentName}.${selectedTreeItem.split(':')[1]}` : '?'

    return (
        <div className={styles.prefillMappingEditor}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>Select a Prefill Mapping</h1>
                    <h3>{formName}.{fieldKey} &rarr; {targetName}</h3>
                </div>
                
                <Box className={styles.treeContainer}>
                    <SimpleTreeView onSelectedItemsChange={(_event, itemId) => {
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
                <Button variant="contained" color="primary" disabled={!selectedTreeItem}>Save</Button>
            </div>
        </div>
    )
}