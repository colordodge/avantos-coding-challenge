import { useSelector } from 'react-redux'
import styles from './PrefillMappingView.module.css'
import { selectSelectedForm, selectSelectedNode } from '../../store/slices/blueprintSlice'
import type { Form } from '../../store/types'


function getPropertyKeys(form: Form | undefined | null): string[] {
    if (!form) {
        return []
    }
    return Object.keys(form.field_schema.properties)
}

export function PrefillMappingView() {

    const selectedForm = useSelector(selectSelectedForm)
    const propertyKeys = getPropertyKeys(selectedForm)
    const selectedNode = useSelector(selectSelectedNode)
    const formName = selectedNode?.data.name ?? 'Form'

    const properties = propertyKeys.map((key) => {
        return (
            <div key={key}>{key}</div>
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