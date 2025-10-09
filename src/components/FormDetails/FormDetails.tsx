import styles from './FormDetails.module.css'
import { PrefillMappingView } from './PrefillMappingView'
import { PrefillMappingEditor } from './PrefillMappingEditor'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'


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
            <AnimatePresence>
                { formMode === 'view' ? (
                    <motion.div
                        className={styles.motionContainer}
                        key='view'
                        initial={{ x: -500 }}
                        animate={{ x: 0 }}
                        exit={{ x: -500 }}
                        transition={{ 
                            duration: 0.2, 
                            ease: 'easeOut'
                        }}
                    >
                        <PrefillMappingView handleFieldClick={handleFieldClick} onClose={onClose} />
                    </motion.div>
                    
                ) : selectedField ? (
                    <motion.div
                        className={styles.motionContainer}
                        key='edit'
                        initial={{ x: 500 }}
                        animate={{ x: 0 }}
                        exit={{ x: 500 }}
                        transition={{ 
                            duration: 0.2, 
                            ease: 'easeOut'
                        }}
                    >
                        <PrefillMappingEditor selectedFieldKey={selectedField} onCancel={handleCancel} />
                    </motion.div>
                ) : null
                }
            </AnimatePresence>
        </div>
    )
}