import { useSelector, useDispatch } from 'react-redux'
import styles from './PrefillMappingView.module.css'
import { selectSelectedForm, selectSelectedNode } from '../../store/slices/blueprintSlice'
import type { Form } from '../../store/types'
import { removePrefillMapping, selectPrefillMappings } from '../../store/slices/prefillMappingSlice'
import ClearIcon from '@mui/icons-material/Clear'


function getPropertyKeys(form: Form | undefined | null): string[] {
    if (!form) {
        return []
    }
    return Object.keys(form.field_schema.properties)
}

export function PrefillMappingView({ handleFieldClick }: { handleFieldClick: (field: string) => void }) {

    const dispatch = useDispatch()
    const selectedForm = useSelector(selectSelectedForm)
    const propertyKeys = getPropertyKeys(selectedForm)
    const selectedNode = useSelector(selectSelectedNode)
    const formName = selectedNode?.data.name ?? 'Form'
    const prefillMappings = useSelector(selectPrefillMappings)

    const properties = propertyKeys.map((key) => {

        const handleClearIconClick = (event: React.MouseEvent) => {
            event.stopPropagation()
            if (selectedNode?.id) {
                dispatch(removePrefillMapping({targetNodeId: selectedNode.id, targetFieldKey: key}))
            }
        }

        // check to see if the form node + field key is in the prefill mappings
        const prefillMapping = prefillMappings.find(mapping => mapping.targetNodeId === selectedNode?.id && mapping.targetFieldKey === key)

        const stringContent = prefillMapping ? 
        `${key}: ${prefillMapping.source.name}.${prefillMapping.source.fieldKey}` 
        : `${key}`

        const innerContent = prefillMapping ? 
        (<div className={styles.keyContainer}>
            <div className={styles.key}>{stringContent}</div> 
            <div className={styles.clearIconContainer} onClick={handleClearIconClick}><ClearIcon sx={{color: '#fff', fontSize: '14px' }}/></div>
            </div>) : 
        (<div> {stringContent} </div>)

        return (
            <div key={key} className={styles.property} onClick={() => handleFieldClick(key)}>{innerContent}</div>
        )
    })
    
    return (
        <div className={styles.prefillMappingView}>
            <h1>{formName}</h1>
            <h3>Prefill Mapping</h3>
            <div className={styles.properties}>
                {properties}
            </div>
        </div>
    )
}