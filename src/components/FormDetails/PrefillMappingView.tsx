import { useSelector } from 'react-redux'
import styles from './PrefillMappingView.module.css'
import { selectSelectedForm, selectSelectedNode } from '../../store/slices/blueprintSlice'
import type { Form } from '../../store/types'
import { selectPrefillMappings } from '../../store/slices/prefillMappingSlice'


function getPropertyKeys(form: Form | undefined | null): string[] {
    if (!form) {
        return []
    }
    return Object.keys(form.field_schema.properties)
}

export function PrefillMappingView({ handleFieldClick }: { handleFieldClick: (field: string) => void }) {

    const selectedForm = useSelector(selectSelectedForm)
    const propertyKeys = getPropertyKeys(selectedForm)
    const selectedNode = useSelector(selectSelectedNode)
    const formName = selectedNode?.data.name ?? 'Form'
    const prefillMappings = useSelector(selectPrefillMappings)

    const properties = propertyKeys.map((key) => {

        // check to see if the form node + field key is in the prefill mappings
        const prefillMapping = prefillMappings.find(mapping => mapping.targetNodeId === selectedNode?.id && mapping.targetFieldKey === key)

        const stringContent = prefillMapping ? 
        `${key}: ${prefillMapping.source.name}.${prefillMapping.source.fieldKey}` 
        : `${key}`

        return (
            <div key={key} className={styles.property} onClick={() => handleFieldClick(key)}>{stringContent}</div>
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