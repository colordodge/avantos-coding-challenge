import styles from './FormDetails.module.css'
import { PrefillMappingView } from './PrefillMappingView'
import { PrefillMappingEditor } from './PrefillMappingEditor'
import { useState } from 'react'


type FormMode = 'view' | 'edit'

export function FormDetails({ onClose }: { onClose: () => void }) {

    const [formMode, setFormMode] = useState<FormMode>('view')
    const [selectedField, setSelectedField] = useState<string | null>(null)

    const handleFieldClick = (field: string) => {
        setFormMode('edit')
        setSelectedField(field)
    }

    const handleCancel = () => {
        setFormMode('view')
        setSelectedField(null)
    }
    
    return (
        <div className={styles.formDetails}>
           { formMode === 'view' ? (
            <PrefillMappingView handleFieldClick={handleFieldClick} onClose={onClose} />
           ) : selectedField ? (
            <PrefillMappingEditor selectedFieldKey={selectedField} onCancel={handleCancel} />
           ) : null
           }
        </div>
    )
}