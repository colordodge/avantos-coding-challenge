import { useSelector, useDispatch } from 'react-redux'
import styles from './PrefillMappingView.module.css'
import { selectSelectedNode } from '../../store/slices/blueprintSlice'
import type { Form } from '../../store/types'
import { clearRecentlyAddedMapping, removePrefillMapping, selectPrefillMappings, selectRecentlyAddedMapping } from '../../store/slices/prefillMappingSlice'
import ClearIcon from '@mui/icons-material/Clear'
import { Button } from '@mui/material'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { selectSelectedForm } from '../../store/selectors/blueprintSelectors'


function getPropertyKeys(form: Form | undefined | null): string[] {
    if (!form) {
        return []
    }
    return Object.keys(form.field_schema.properties)
}

export function PrefillMappingView({ handleFieldClick, onClose }: { handleFieldClick: (field: string) => void, onClose: () => void }) {

    const dispatch = useDispatch()
    const selectedForm = useSelector(selectSelectedForm)
    const propertyKeys = getPropertyKeys(selectedForm)
    const selectedNode = useSelector(selectSelectedNode)
    const formName = selectedNode?.data.name ?? 'Form'
    const prefillMappings = useSelector(selectPrefillMappings)
    const recentlyAddedMapping = useSelector(selectRecentlyAddedMapping)

    // Clear the recently added mapping after animation completes
    useEffect(() => {
        if (recentlyAddedMapping) {
            const timer = setTimeout(() => {
                dispatch(clearRecentlyAddedMapping())
            }, 1500) // Match animation duration
            
            return () => clearTimeout(timer)
        }
    }, [recentlyAddedMapping, dispatch])

    const properties = propertyKeys.map((key) => {

        const handleClearIconClick = (event: React.MouseEvent) => {
            event.stopPropagation()
            if (selectedNode?.id) {
                dispatch(removePrefillMapping({targetNodeId: selectedNode.id, targetFieldKey: key}))
            }
        }

        // check to see if the form node + field key is in the prefill mappings
        const prefillMapping = prefillMappings.find(mapping => mapping.targetNodeId === selectedNode?.id && mapping.targetFieldKey === key)

        // Check if this is the recently added mapping
        const isRecentlyAdded = recentlyAddedMapping?.targetNodeId === selectedNode?.id && 
                               recentlyAddedMapping?.targetFieldKey === key

        const stringContent = prefillMapping ? 
        `${key} : ${prefillMapping.source.name}.${prefillMapping.source.fieldKey}` 
        : `${key}`

        const innerContent = prefillMapping ? 
        (<div className={styles.keyContainer}>
            <div className={styles.key}>{stringContent}</div> 
            <div className={styles.clearIconContainer} onClick={handleClearIconClick}><ClearIcon sx={{color: '#fff', fontSize: '14px' }}/></div>
            </div>) : 
        (<div> {stringContent} </div>)

        // Use motion.div with conditional animation for recently added mapping
        const PropertyWrapper = isRecentlyAdded ? motion.div : 'div'
        
        const animationProps = isRecentlyAdded ? {
            initial: { 
                backgroundColor: 'var(--primary-main)',
                borderColor: 'var(--primary-main)',
            },
            animate: { 
                backgroundColor: '#fff', 
                borderColor: '#ccc',
            },
            transition: { 
                duration: 1.5,
            }
        } : {}

        return (
            <PropertyWrapper 
                key={key} 
                className={styles.property} 
                onClick={() => handleFieldClick(key)}
                {...animationProps}
            >
                {innerContent}
            </PropertyWrapper>
        )
    })
    
    return (
        <div className={styles.prefillMappingView}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>{formName}</h1>
                    <h3>Prefill Mapping</h3>
                </div>
                
                <div className={styles.properties}>
                    {properties}
                </div>
            </div>

            <div className={styles.actionMenu}>
                <Button variant="contained" color="primary" onClick={onClose}>Done</Button>
            </div>
            
        </div>
    )
}