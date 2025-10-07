import { BlueprintGraph } from './components/DAG/BlueprintGraph'
import styles from './App.module.css'

function App() {
  return (
    <>
      <div className={styles.app}>
        <BlueprintGraph />
      </div>
    </>
  )
}

export default App
