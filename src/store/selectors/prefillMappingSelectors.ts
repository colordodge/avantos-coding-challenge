import { createSelector } from "@reduxjs/toolkit"
import { selectBlueprintData, selectSelectedNode } from "../slices/blueprintSlice"
import type { DataSource } from "../slices/prefillMappingSlice"
import { getAncestorIds } from "../utils/graphUtils"
import type { BlueprintData, Node } from "../types"


// return a flat list of DataSources representing all possible mappings
export const selectAvailableDataSourceMappings = createSelector(
    [selectBlueprintData, selectSelectedNode],
    (data: BlueprintData | null, selectedNode: Node | null) => {
        if (!data || !selectedNode) {
            return [] as DataSource[]
        }

        const availableSources: DataSource[] = []

        // Global fields
        const globalFieldKeys = ['test_data', 'test_data2', 'test_data3']
        globalFieldKeys.forEach((fieldKey) => {
            availableSources.push({
                type: 'global',
                id: 'global',
                name: 'Global',
                fieldKey
            })
        })

        // Form fields from ancestor nodes
        let ancestorIds = getAncestorIds(selectedNode.id || '', data.edges)
        ancestorIds = [...new Set(ancestorIds)]
        const ancestorNodes = data.nodes.filter((node) => ancestorIds.includes(node.id))

        ancestorNodes.forEach((node) => {
            const form = data.forms.find((form) => form.id === node.data.component_id)
            if (!form) {
                return
            }
            const fieldKeys = Object.keys(form.field_schema.properties)
            fieldKeys.forEach((fieldKey) => {
                availableSources.push({
                    type: 'form_field',
                    id: node.id,
                    name: node.data.name,
                    fieldKey
                })
            })
        })

        return availableSources
    }
)

// Grouped selector for UI consumption: groups and fast leaf lookup
export interface DataSourceLeaf {
    leafId: string
    label: string
    source: DataSource
}

export interface DataSourceGroup {
    parentId: string
    parentName: string
    children: DataSourceLeaf[]
}

export interface GroupedAvailableDataSources {
    groups: DataSourceGroup[]
    leafIdToSource: Record<string, DataSource>
}

export const selectGroupedAvailableDataSources = createSelector(
    [selectAvailableDataSourceMappings],
    (sources: DataSource[]): GroupedAvailableDataSources => {
        const parentIdToGroup: Map<string, { parentName: string, children: DataSourceLeaf[] }> = new Map()
        const leafIdToSource: Record<string, DataSource> = {}

        sources.forEach((src) => {
            const parentId = src.id
            const parentName = src.name
            const leafId = `${parentId}:${src.fieldKey}`

            // map for O(1) lookup
            leafIdToSource[leafId] = src

            // group aggregation
            const group = parentIdToGroup.get(parentId)
            const child: DataSourceLeaf = {
                leafId,
                label: src.fieldKey,
                source: src
            }
            if (!group) {
                parentIdToGroup.set(parentId, { parentName, children: [child] })
            } else {
                group.children.push(child)
            }
        })

        // stable ordering for predictable rendering: Global first, then alphabetically
        const groups: DataSourceGroup[] = Array.from(parentIdToGroup.entries())
            .map(([parentId, { parentName, children }]) => ({
                parentId,
                parentName,
                children: children.sort((a, b) => a.label.localeCompare(b.label))
            }))
            .sort((a, b) => {
                // Global always comes first
                if (a.parentId === 'global') return -1
                if (b.parentId === 'global') return 1
                // Otherwise sort alphabetically by name
                return a.parentName.localeCompare(b.parentName)
            })

        return { groups, leafIdToSource }
    }
)