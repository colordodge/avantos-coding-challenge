import styles from './FormDetails.module.css'
import { PrefillMappingView } from './PrefillMappingView'
import { PrefillMappingEditor } from './PrefillMappingEditor'
import { useState } from 'react'

type FormMode = 'view' | 'edit'

export function FormDetails() {

    const [formMode, setFormMode] = useState<FormMode>('view')

    return (
        <div className={styles.formDetails}>
           { formMode === 'view' ? (
            <PrefillMappingView />
           ) : (
            <PrefillMappingEditor />
           )
           }
        </div>
    )
}